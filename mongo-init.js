// MongoDB initialization script
db = db.getSiblingDB('skillport');

// Create collections
db.createCollection('users');
db.createCollection('communities');
db.createCollection('contests');
db.createCollection('otps');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "community": 1 });
db.users.createIndex({ "status": 1 });

db.communities.createIndex({ "code": 1 }, { unique: true });
db.communities.createIndex({ "admin": 1 });

db.contests.createIndex({ "community": 1, "batch": 1 });
db.contests.createIndex({ "mentor": 1 });
db.contests.createIndex({ "startTime": 1, "endTime": 1 });

db.otps.createIndex({ "email": 1 });
db.otps.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('Database initialized successfully');
