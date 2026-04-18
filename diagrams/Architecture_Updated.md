# FleetOS System Architecture (Updated)

This diagram illustrates the current modular architecture of FleetOS, highlighting the decoupled service layers and the centralized data persistence via Prisma.

```mermaid
graph TD
    subgraph "Frontend (Next.js & Recharts)"
        UI[Luxury Dashboard UI]
        API_C[API Client /lib/api]
    end

    subgraph "Backend (Express & SOLID)"
        Routes[Express Routes Layer]
        Controllers[Module Controllers]
        Services[Business Logic / Services]
        Repos[Data Repositories / Interfaces]
    end

    subgraph "Core Modules"
        M_Auth[Auth Module]
        M_Staff[Staff Module]
        M_Fleet[Fleet Module]
        M_Finance[Finance Module]
        M_Transit[Transit Module]
        M_Trip[Trip Module]
        M_Analytics[Analytics Module]
    end

    DB[(PostgreSQL / Prisma)]

    UI --> API_C
    API_C --> Routes
    
    Routes --> M_Auth
    Routes --> M_Staff
    Routes --> M_Fleet
    Routes --> M_Finance
    Routes --> M_Transit
    Routes --> M_Trip
    Routes --> M_Analytics

    M_Auth --> Controllers
    M_Staff --> Controllers
    M_Fleet --> Controllers
    M_Finance --> Controllers
    M_Transit --> Controllers
    M_Trip --> Controllers
    M_Analytics --> Controllers

    Controllers --> Services
    Services --> Repos
    Repos --> DB
```

## Legacy Architecture
<img width="1090" height="1212" alt="legacy_arch" src="https://github.com/user-attachments/assets/52791c62-ec73-4e0e-92f5-de61a90f58a9" />
