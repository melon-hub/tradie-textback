# Database Schema Reference

## Jobs Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| customer_name | text | Customer's name |
| phone | text | Customer's phone (NOT customer_phone) |
| job_type | text | Type of job |
| location | text | Job location (NOT customer_address) |
| urgency | text | Job urgency level |
| status | text | Job status |
| estimated_value | numeric | Estimated job value |
| description | text | Job description |
| preferred_time | text | Customer's preferred time |
| last_contact | timestamp | Last contact time |
| sms_blocked | boolean | SMS blocking flag |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| client_id | uuid | Tradie's user ID (confusing name!) |
| quote_accepted_at | timestamp | Quote acceptance time |
| quote_accepted_by | text | Who accepted quote |
| cancellation_reason | text | Reason for cancellation |
| last_update_request_at | timestamp | Last update request |

## Important Notes
- `phone` is the customer's phone (NOT `customer_phone`)
- `location` is the job location (NOT `customer_address`)
- `client_id` is actually the TRADIE's user ID (confusing naming!)
- Customers are identified by phone number, not user ID

## Profiles Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Auth user ID |
| phone | text | User's phone |
| name | text | User's name |
| role | text | User role |
| user_type | text | 'tradie' or 'client' |
| address | text | User's address |
| is_admin | boolean | Admin flag |
| onboarding_completed | boolean | Onboarding status |

## Business Settings Table
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | User ID (foreign key) |
| business_name | text | Business name |
| (other columns...) | | |

Last updated: 2025-08-06