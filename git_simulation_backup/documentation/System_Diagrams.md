# 📊 System Architecture Diagrams

These charts show how the current version of FleetOS is built and how data flows through the system.

## 1. Database Relationship Map (ER Diagram)
This shows how different things (Users, Buses, Trips) are connected to each other.

```mermaid
erDiagram
    Organization ||--o{ User : "has"
    Organization ||--o{ Vehicle : "owns"
    Organization ||--o{ Route : "defines"
    Organization ||--o{ Transaction : "logs"
    
    User ||--o| DriverProfile : "is"
    DriverProfile ||--o{ Trip : "executes"
    DriverProfile ||--o| Wallet : "possesses"
    DriverProfile ||--o{ Loan : "owes"
    
    Vehicle ||--o{ Trip : "assigned_to"
    Vehicle ||--o{ Telemetry : "pings"
    
    Route ||--o{ RouteStop : "contains"
    Route ||--o{ Trip : "follows"
    Stop ||--o{ RouteStop : "links_to"
```

## 2. Trip Lifecycle (Logic Flow)
This shows the step-by-step process of a Dispatcher starting a trip and a Driver finishing it.

```mermaid
sequenceDiagram
    participant D as Dispatcher (Frontend)
    participant API as Backend API
    participant DB as MySQL (Prisma)
    participant Dr as Driver (Frontend)

    D->>API: POST /api/trips (Schedule)
    API->>DB: Create Trip (SCHEDULED)
    DB-->>API: Success
    API-->>D: Trip Scheduled

    Dr->>API: PATCH /api/trips/:id/start
    API->>DB: Update Trip (IN_PROGRESS) + Driver (ON_TRIP)
    API-->>Dr: Transit Initiated

    Dr->>API: PATCH /api/trips/:id/end
    API->>DB: Update Trip (COMPLETED) + Driver (AVAILABLE)
    Note over API,DB: Logic: Update Driver Wallet? (Pending)
    API-->>Dr: Transit Closed
```

## 3. Data Flow (Frontend to Backend)
This shows how your buttons talk to the server.

```mermaid
flowchart LR
    A[React Components] --> B[lib/api.ts Client]
    B --> C{HTTP Request}
    C --> D[Express Routes]
    D --> E[Services Logic]
    E --> F[Prisma Repositories]
    F --> G[(MySQL Database)]
```
