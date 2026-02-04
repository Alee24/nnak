# NNAK Membership Management System

A comprehensive membership management system built with PHP backend and modern frontend interface.

## Features

- **Member Management**: Registration, profiles, and directory
- **Membership Types**: Flexible membership tiers and pricing
- **Payment Tracking**: Payment history and invoicing
- **Event Management**: Create and manage events with registration
- **Admin Dashboard**: Analytics, reports, and system management
- **Responsive Design**: Works on desktop, tablet, and mobile

## Technology Stack

- **Backend**: PHP 7.4+ with Apache
- **Database**: MySQL 5.7+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Server**: Apache with mod_rewrite

## Installation

### Prerequisites

- Apache server with PHP 7.4+
- MySQL 5.7+
- mod_rewrite enabled

### Setup Steps

1. **Clone the repository**
   ```bash
   cd c:\Users\Metto\Desktop\Codes
   # Project already in NNAK folder
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create database**
   ```sql
   CREATE DATABASE nnak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run migrations**
   ```bash
   php backend/database/migrate.php
   ```

5. **Configure Apache**
   - Ensure DocumentRoot points to your project
   - Enable mod_rewrite
   - Restart Apache

6. **Access the application**
   - Frontend: http://localhost/NNAK/frontend/public
   - API: http://localhost/NNAK/backend/api

## Database Schema

### Tables

- `members` - Member information and authentication
- `membership_types` - Different membership tiers
- `payments` - Payment transactions and history
- `events` - Events and activities
- `event_registrations` - Event attendance tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new member
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user

### Members
- `GET /api/members` - List members (admin)
- `GET /api/members/:id` - Get member details
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Deactivate member

### Membership Types
- `GET /api/membership-types` - List all types
- `POST /api/membership-types` - Create type (admin)
- `PUT /api/membership-types/:id` - Update type (admin)

### Payments
- `POST /api/payments` - Record payment
- `GET /api/payments/:id` - Payment details
- `GET /api/members/:id/payments` - Member payment history

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event (admin)
- `POST /api/events/:id/register` - Register for event

### Reports
- `GET /api/reports/members` - Member statistics
- `GET /api/reports/payments` - Payment reports
- `GET /api/reports/events` - Event analytics

## Project Structure

```
NNAK/
├── backend/
│   ├── config/
│   │   ├── config.php
│   │   └── Database.php
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── MemberController.php
│   │   ├── MembershipController.php
│   │   ├── PaymentController.php
│   │   ├── EventController.php
│   │   └── ReportController.php
│   ├── database/
│   │   ├── migrations/
│   │   └── migrate.php
│   ├── .htaccess
│   └── index.php
├── frontend/
│   └── public/
│       ├── css/
│       │   └── styles.css
│       ├── js/
│       │   └── app.js
│       ├── pages/
│       │   ├── login.html
│       │   ├── register.html
│       │   ├── dashboard.html
│       │   ├── profile.html
│       │   ├── members.html
│       │   ├── admin.html
│       │   └── events.html
│       └── index.html
├── .env.example
├── .gitignore
└── README.md
```

## Development

### Running Locally

1. Start Apache and MySQL (via XAMPP or similar)
2. Access http://localhost/NNAK/frontend/public
3. API available at http://localhost/NNAK/backend/api

### Database Migrations

To run migrations:
```bash
php backend/database/migrate.php
```

To rollback (if implemented):
```bash
php backend/database/migrate.php rollback
```

## Security

- Passwords are hashed using PHP's `password_hash()`
- SQL injection prevention via PDO prepared statements
- CORS headers configured for API security
- Session management with secure settings
- Input validation on all endpoints

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## License

Proprietary - NNAK Organization

## Support

For issues or questions, contact the development team.
