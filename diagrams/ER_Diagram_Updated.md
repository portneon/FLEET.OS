# FleetOS Entity Relationship Diagram (Updated)

This diagram reflects the current database schema, including the new relationships established for Analytics and Route Management.

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : "has"
    ORGANIZATION ||--o{ STAFF : "employs"
    ORGANIZATION ||--o{ VEHICLE : "owns"
    
    USER ||..o{ STAFF : "is_linked_to"
    
    STAFF ||--o{ DRIVER_PROFILE : "as"
    DRIVER_PROFILE ||--o{ TRIP : "operates"
    VEHICLE ||--o{ TRIP : "dispatched_for"
    
    ROUTE ||--o{ ROUTE_STOP : "consists_of"
    STOP ||--o{ ROUTE_STOP : "part_of"
    ROUTE ||--o{ TRIP : "serves"
    
    TRIP ||--o{ BOOKING : "generates"
    ORGANIZATION ||--o{ TRANSACTION : "records"
    
    USER {
        string id PK
        string email
        string name
        string role
    }
    
    STAFF {
        string id PK
        string email
        string role
    }
    
    TRIP {
        string id PK
        string status
        datetime scheduledStart
        float revenue
    }
    
    TRANSACTION {
        string id PK
        float amount
        string type
        string category
    }
```

## Legacy ER Diagram
<img width="1470" height="1570" alt="legacy_er" src="https://github.com/user-attachments/assets/ac35a7aa-e86a-4e70-868d-7b581e6f785f" />
