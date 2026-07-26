# AlphaNXT Firebase Structure

## Authentication
- Email & Password
- Google Sign-In
- Email Verification

---

## Firestore Collections

users
portfolio
transactions
watchlist
courses
lessons
quizzes
badges
notifications
challenges
leaderboard
market_data
settings
admins
admin_logs

---

## Storage

profile_images/
course_images/
course_videos/
certificates/
app_banners/

---

## New User

When a user registers:

- Create user document
- Assign ₹1,00,000 virtual balance
- XP = 0
- Level = Beginner
- Badges = []
- Watchlist = []
- Portfolio = Empty

---

## Security Rules

- Users can only access their own data.
- Admins can manage all collections.
- Authentication required for protected data.
- Never expose API keys.
