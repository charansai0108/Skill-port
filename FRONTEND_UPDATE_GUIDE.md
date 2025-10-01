# 📝 Frontend Update Guide - Dynamic Data Integration

## ✅ **What's Been Done:**

### **Backend APIs - All Complete:**
1. ✅ `/api/admin/students` - Students with pagination & filters
2. ✅ `/api/admin/mentors` - Mentors with stats
3. ✅ `/api/admin/contests` - Contests with participants
4. ✅ `/api/admin/analytics` - Platform analytics
5. ✅ `/api/admin/leaderboard` - Rankings
6. ✅ `/api/admin/profile` - Admin profile & batches
7. ✅ `/api/dashboard/admin` - Dashboard summary

### **Frontend Pages - Started:**
1. 🔄 `/admin/users` - Partially updated (needs completion)
2. ⏳ `/admin/mentors` - Needs update
3. ⏳ `/admin/contests` - Needs update
4. ⏳ `/admin/analytics` - Needs update
5. ⏳ `/admin/leaderboard` - Needs update
6. ⏳ `/admin/profile` - Needs update
7. ✅ `/admin/dashboard` - Already dynamic

---

## 🔧 How to Complete Each Page

### Pattern for All Pages:

```typescript
// 1. Remove hardcoded useState with sample data
// OLD:
const [users, setUsers] = useState([{ id: 1, name: 'Sample'... }])

// NEW:
const [users, setUsers] = useState<any[]>([])
const [loading, setLoading] = useState(true)

// 2. Add useEffect to fetch data
useEffect(() => {
  fetchData()
}, [currentPage, searchTerm, filters])

// 3. Create fetch function
const fetchData = async () => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/admin/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const result = await response.json()
    setUsers(result.data.students)
    setTotalPages(result.data.pagination.totalPages)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}

// 4. Remove client-side filtering (now done by API)
// DELETE: const filteredUsers = users.filter(...)
// USE: const filteredUsers = users (API returns filtered data)

// 5. Update render to use real data
{users.map(user => (
  <div key={user.id}>{user.name}</div>
))}
```

---

## 📄 Specific Page Updates

### 1. Students Page (`apps/web/app/admin/users/page.tsx`)

**Status**: 🔄 In Progress

**What to do:**
1. ✅ Added API fetch function
2. ✅ Commented out hardcoded data
3. ⏳ Need to update `pageUsers` variable reference
4. ⏳ Add batch filter dropdown using `batches` from API

**Find and replace:**
```typescript
// Find:
{pageUsers.map((user) => (

// Replace with:
{users.map((user) => (
```

**Add batch filter:**
```tsx
<select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
  <option value="all">All Batches</option>
  {batches.map(batch => (
    <option key={batch.id} value={batch.id}>{batch.name}</option>
  ))}
</select>
```

---

### 2. Mentors Page (`apps/web/app/admin/mentors/page.tsx`)

**Current**: Has hardcoded mentor data

**Update:**
```typescript
// Add state
const [mentors, setMentors] = useState<any[]>([])
const [specializations, setSpecializations] = useState<string[]>([])
const [loading, setLoading] = useState(true)

// Add fetch
useEffect(() => {
  fetchMentors()
}, [currentPage, searchTerm, specializationFilter, statusFilter])

const fetchMentors = async () => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '9',
      ...(searchTerm && { search: searchTerm }),
      ...(specializationFilter !== 'all' && { specialization: specializationFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter })
    })

    const response = await fetch(`/api/admin/mentors?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const result = await response.json()
    setMentors(result.data.mentors)
    setSpecializations(result.data.specializations)
    setTotalPages(result.data.pagination.totalPages)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}

// Remove hardcoded mentor array
// Use {mentors.map(...)} in JSX
```

---

### 3. Contests Page (`apps/web/app/admin/contests/page.tsx`)

**Update:**
```typescript
const [contests, setContests] = useState<any[]>([])
const [stats, setStats] = useState<any>({})
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchContests()
}, [searchTerm, statusFilter])

const fetchContests = async () => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    const params = new URLSearchParams({
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== 'all' && { status: statusFilter })
    })

    const response = await fetch(`/api/admin/contests?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const result = await response.json()
    setContests(result.data.contests)
    setStats(result.data.stats)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

---

### 4. Analytics Page (`apps/web/app/admin/analytics/page.tsx`)

**Update:**
```typescript
const [analyticsData, setAnalyticsData] = useState<any>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchAnalytics()
}, [])

const fetchAnalytics = async () => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/admin/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const result = await response.json()
    setAnalyticsData(result.data)
    
    // Update chart data
    setUserGrowthData({
      labels: result.data.userGrowthData.labels,
      datasets: [{
        label: 'User Growth',
        data: result.data.userGrowthData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      }]
    })
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

---

### 5. Leaderboard Page (`apps/web/app/admin/leaderboard/page.tsx`)

**Update:**
```typescript
const [leaderboard, setLeaderboard] = useState<any[]>([])
const [type, setType] = useState('students') // students or mentors
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchLeaderboard()
}, [type])

const fetchLeaderboard = async () => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/admin/leaderboard?type=${type}&limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const result = await response.json()
    setLeaderboard(result.data.leaderboard)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

---

### 6. Profile Page (`apps/web/app/admin/profile/page.tsx`)

**Update:**
```typescript
const [profile, setProfile] = useState<any>(null)
const [batches, setBatches] = useState<any[]>([])
const [stats, setStats] = useState<any>({})
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchProfile()
}, [])

const fetchProfile = async () => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/admin/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const result = await response.json()
    setProfile(result.data.profile)
    setBatches(result.data.batches)
    setStats(result.data.stats)
    
    // Set form values
    setProfileImage(result.data.profile.profilePic || defaultImage)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}

// Update profile
const saveProfileInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio
      })
    })

    const result = await response.json()
    showToast('Profile updated successfully!', 'success')
    fetchProfile() // Refresh data
  } catch (error) {
    showToast('Failed to update profile', 'error')
  }
}
```

---

## 🎯 Quick Reference

### API Call Pattern:
```typescript
const token = localStorage.getItem('token')

const response = await fetch('/api/admin/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

const result = await response.json()
// Use result.data
```

### Error Handling:
```typescript
if (!response.ok) {
  if (response.status === 401) {
    // Redirect to login
    window.location.href = '/auth/login'
    return
  }
  throw new Error('API call failed')
}
```

---

## ✅ What's Already Dynamic:

- ✅ Dashboard - Uses `/api/dashboard/admin`
- ✅ Navigation bar - Shows on all pages
- ✅ Authentication - All routes protected

## 🔄 What Needs Updates:

- 🔄 Students page - fetch function added, needs cleanup
- ⏳ Mentors page - needs API integration
- ⏳ Contests page - needs API integration
- ⏳ Analytics page - needs API integration
- ⏳ Leaderboard page - needs API integration
- ⏳ Profile page - needs API integration

---

**All backend APIs are ready! Frontend pages just need to replace hardcoded data with API calls.** 🚀

