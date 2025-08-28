const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Community = require('../models/Community');
const User = require('../models/User');
const { auth, communityAdmin, communityModerator, postAuthor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };
    
    if (req.query.community) filter.community = req.query.community;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.author) filter.author = req.query.author;
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (req.query.sortBy) {
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { 'likes.length': -1, createdAt: -1 };
        break;
      case 'comments':
        sort = { 'comments.length': -1, createdAt: -1 };
        break;
      case 'views':
        sort = { views: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Get posts with pagination
    const posts = await Post.find(filter)
      .populate('author', 'firstName lastName username profilePicture')
      .populate('community', 'name description category')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    // Add user interaction status if authenticated
    let postsWithInteraction = posts;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        postsWithInteraction = posts.map(post => {
          const postObj = post.toObject();
          postObj.isLiked = post.likes.includes(userId);
          postObj.isDisliked = post.dislikes.includes(userId);
          return postObj;
        });
      } catch (error) {
        // Token invalid, continue without interaction info
        postsWithInteraction = posts.map(post => {
          const postObj = post.toObject();
          postObj.isLiked = false;
          postObj.isDisliked = false;
          return postObj;
        });
      }
    }

    res.json({
      success: true,
      data: {
        posts: postsWithInteraction,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          postsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a specific post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName username profilePicture bio')
      .populate('community', 'name description category privacy')
      .populate('comments.author', 'firstName lastName username profilePicture');

    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    // Add user interaction status if authenticated
    let postWithInteraction = post.toObject();
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        postWithInteraction.isLiked = post.likes.includes(userId);
        postWithInteraction.isDisliked = post.dislikes.includes(userId);
        postWithInteraction.canModify = post.isAuthor(userId);
      } catch (error) {
        // Token invalid, continue without interaction info
        postWithInteraction.isLiked = false;
        postWithInteraction.isDisliked = false;
        postWithInteraction.canModify = false;
      }
    }

    res.json({
      success: true,
      data: postWithInteraction
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').trim().isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters'),
  body('type').isIn(['discussion', 'question', 'announcement', 'resource', 'showcase']).withMessage('Invalid post type'),
  body('category').optional().isIn(['general', 'help', 'news', 'tutorial', 'project', 'other']).withMessage('Invalid category'),
  body('community').isMongoId().withMessage('Valid community ID required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      title, 
      content, 
      type, 
      category, 
      community, 
      tags, 
      attachments 
    } = req.body;

    // Check if community exists and user is a member
    const communityDoc = await Community.findById(community);
    if (!communityDoc) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    const membership = communityDoc.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to post'
      });
    }

    // Create post
    const post = new Post({
      title,
      content,
      type,
      category: category || 'general',
      author: req.user.id,
      community,
      tags: tags || [],
      attachments: attachments || []
    });

    await post.save();

    // Update community post count
    await Community.findByIdAndUpdate(community, {
      $inc: { postCount: 1 }
    });

    // Populate author and community for response
    await post.populate('author', 'firstName lastName username profilePicture');
    await post.populate('community', 'name description category');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (Author/Moderator/Admin)
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').optional().trim().isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters'),
  body('type').optional().isIn(['discussion', 'question', 'announcement', 'resource', 'showcase']).withMessage('Invalid post type'),
  body('category').optional().isIn(['general', 'help', 'news', 'tutorial', 'project', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has permission to update
    if (!post.canModify(req.user.id)) {
      // Check if user is moderator or admin of the community
      const community = await Community.findById(post.community);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      const membership = community.members.find(member => 
        member.user.toString() === req.user.id && member.isActive
      );
      
      if (!membership || !['admin', 'moderator'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this post'
        });
      }
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('author', 'firstName lastName username profilePicture')
    .populate('community', 'name description category');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (Author/Moderator/Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has permission to delete
    if (!post.canModify(req.user.id)) {
      // Check if user is moderator or admin of the community
      const community = await Community.findById(post.community);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      const membership = community.members.find(member => 
        member.user.toString() === req.user.id && member.isActive
      );
      
      if (!membership || !['admin', 'moderator'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this post'
        });
      }
    }

    // Soft delete - mark as deleted
    post.status = 'deleted';
    await post.save();

    // Update community post count
    await Community.findByIdAndUpdate(post.community, {
      $inc: { postCount: -1 }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addLike(req.user.id);

    res.json({
      success: true,
      message: 'Post liked successfully',
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length,
        isLiked: true,
        isDisliked: false
      }
    });

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post'
    });
  }
});

// @route   DELETE /api/posts/:id/like
// @desc    Remove like from a post
// @access  Private
router.delete('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.removeLike(req.user.id);

    res.json({
      success: true,
      message: 'Like removed successfully',
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length,
        isLiked: false,
        isDisliked: false
      }
    });

  } catch (error) {
    console.error('Remove like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing like'
    });
  }
});

// @route   POST /api/posts/:id/dislike
// @desc    Dislike a post
// @access  Private
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addDislike(req.user.id);

    res.json({
      success: true,
      message: 'Post disliked successfully',
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length,
        isLiked: false,
        isDisliked: true
      }
    });

  } catch (error) {
    console.error('Dislike post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while disliking post'
    });
  }
});

// @route   DELETE /api/posts/:id/dislike
// @desc    Remove dislike from a post
// @access  Private
router.delete('/:id/dislike', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.removeDislike(req.user.id);

    res.json({
      success: true,
      message: 'Dislike removed successfully',
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length,
        isLiked: false,
        isDisliked: false
      }
    });

  } catch (error) {
    console.error('Remove dislike error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing dislike'
    });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comments', [
  auth,
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const { content } = req.body;

    await post.addComment(req.user.id, content);

    // Populate the new comment's author
    await post.populate('comments.author', 'firstName lastName username profilePicture');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comments: post.comments,
        commentCount: post.comments.length
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
});

// @route   PUT /api/posts/:id/comments/:commentId
// @desc    Update a comment
// @access  Private (Comment Author/Moderator/Admin)
router.put('/:id/comments/:commentId', [
  auth,
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user has permission to update
    if (comment.author.toString() !== req.user.id) {
      // Check if user is moderator or admin of the community
      const community = await Community.findById(post.community);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      const membership = community.members.find(member => 
        member.user.toString() === req.user.id && member.isActive
      );
      
      if (!membership || !['admin', 'moderator'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this comment'
        });
      }
    }

    const { content } = req.body;
    comment.content = content;
    comment.updatedAt = new Date();

    await post.save();

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating comment'
    });
  }
});

// @route   DELETE /api/posts/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private (Comment Author/Moderator/Admin)
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user has permission to delete
    if (comment.author.toString() !== req.user.id) {
      // Check if user is moderator or admin of the community
      const community = await Community.findById(post.community);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      const membership = community.members.find(member => 
        member.user.toString() === req.user.id && member.isActive
      );
      
      if (!membership || !['admin', 'moderator'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this comment'
        });
      }
    }

    comment.remove();
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment'
    });
  }
});

module.exports = router;
