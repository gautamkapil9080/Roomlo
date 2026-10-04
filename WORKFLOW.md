# Roomlo work flow

This diagram shows the main user flow and where each part of the app handles the request. The dashed booking path is a planned feature; bookings and payments are not implemented yet.

```mermaid
flowchart TD
    A[Visitor opens Roomlo] --> B[Browse listings]
    B --> C{What do they want to do?}

    C -->|Find a stay| D[Search by destination]
    D --> E[View listing details]
    E --> F[Read reviews]
    F -. Planned .-> G[Book dates and guests]
    G -. Planned .-> H[Pay and receive confirmation]

    C -->|List a stay| I[Sign up or log in]
    I --> J[Enter listing details and upload photo]
    J --> K[Express route checks request]
    K --> L[Controller validates and saves listing]
    L --> M[(MongoDB stores listing and owner)]
    J --> N[Cloudinary stores listing photo]
    M --> O[Listing appears in browse and search]
    N --> O

    E --> P{Signed in as listing owner?}
    P -->|Yes| Q[Edit or delete listing]
    Q --> K
    E --> R{Signed in guest?}
    R -->|Yes| S[Write a review]
    S --> T[Review saved and shown on listing]
    T --> M

    subgraph App[App structure]
      U[Browser pages: EJS views] --> V[Express routes and middleware]
      V --> W[Controllers]
      W --> M
      W --> N
    end
```

## In one sentence

People browse/search stays, hosts sign in and publish listings with photos, and guests can review listings; booking and payment are future work.
