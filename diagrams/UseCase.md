# FleetOS Use Case Diagrams (Updated)

This diagram outlines the primary interactions available to various actors in the system, now including advanced analytics and route refinement.

```mermaid
graph LR
    subgraph "Administrative Actors"
        Admin((Admin))
        Dispatcher((Dispatcher))
    end

    subgraph "Operational Actors"
        Driver((Driver))
        Mechanic((Mechanic))
    end

    subgraph "System Features"
        UC_Analytics(Global Analytics & Performance Tracking)
        UC_UserMgmt(Dashboard User Auditing)
        UC_RouteMgmt(Route & Stop Sequence Refinement)
        UC_Dispatch(Trip Dispatching)
        UC_Fleet(Fleet Management)
        UC_Finance(Financial Ledger Management)
        UC_TripOps(Live Trip Operations - Start/End)
    end

    Admin --> UC_Analytics
    Admin --> UC_UserMgmt
    Admin --> UC_Finance
    Admin --> UC_Fleet

    Dispatcher --> UC_RouteMgmt
    Dispatcher --> UC_Dispatch
    Dispatcher --> UC_Fleet
    
    Driver --> UC_TripOps
    Mechanic --> UC_Fleet
```

## Legacy Use Cases
<img width="136" height="136" alt="legacy_usecase" src="https://github.com/user-attachments/assets/75e2f3bc-dc1e-468a-928f-7e997f694600" />
