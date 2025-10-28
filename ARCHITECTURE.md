# Architecture Diagram - Vehicle API Integration

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                          COMPONENTS LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ CarFilter   │  │ Booking      │  │ Booking      │              │
│  │    .jsx     │  │ 4Seater.jsx  │  │ 7Seater.jsx  │  ... more    │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                │                  │                       │
│         └────────────────┴──────────────────┘                       │
│                          │                                          │
│                    uses hook                                        │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         HOOKS LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                  ┌─────────────────────┐                            │
│                  │  useVehicles()      │                            │
│                  │  Custom Hook        │                            │
│                  └──────────┬──────────┘                            │
│                             │                                       │
│         ┌───────────────────┼───────────────────┐                  │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│    [vehicles]          [loading]           [error]                 │
│       state               state              state                 │
│                             │                                       │
│                       calls service                                │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│               ┌──────────────────────────┐                          │
│               │  vehicleService.js       │                          │
│               └────────┬─────────────────┘                          │
│                        │                                            │
│        ┌───────────────┼───────────────┐                           │
│        │               │               │                           │
│        ▼               ▼               ▼                           │
│  getVehicles()  transformData()  fetchAndTransform()               │
│                                                                     │
│  • Fetch API        • Map fields      • Combine both               │
│  • Auth token       • Select image    • Return ready data          │
│  • Error handle     • Type convert                                 │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                     HTTP Request
                     with Bearer token
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT (Backend)                           │
├─────────────────────────────────────────────────────────────────────┤
│  GET http://localhost:8080/api/vehicles/get                        │
│                                                                     │
│  Headers:                                                           │
│    - Authorization: Bearer {token}                                 │
│    - Content-Type: application/json                                │
│                                                                     │
│  Response: Array<Vehicle>                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌──────────┐     mount      ┌─────────────┐
│Component ├───────────────>│ useVehicles │
└──────────┘                └──────┬──────┘
                                   │
                              auto fetch
                                   │
                                   ▼
                          ┌────────────────┐
                          │ vehicleService │
                          └────────┬───────┘
                                   │
                            API call with
                            Bearer token
                                   │
                                   ▼
                             ┌──────────┐
                             │ Backend  │
                             └─────┬────┘
                                   │
                              Response
                                   │
                                   ▼
                          ┌────────────────┐
                          │ Transform Data │
                          │ • Map fields   │
                          │ • Add image    │
                          │ • Set type     │
                          └────────┬───────┘
                                   │
                             Update state
                                   │
                                   ▼
                          ┌────────────────┐
                          │   Component    │
                          │   Re-render    │
                          └────────────────┘
```

## 🛡️ Error Handling Flow

```
                    ┌─────────────┐
                    │ useVehicles │
                    └──────┬──────┘
                           │
                     Check token
                           │
              ┌────────────┴────────────┐
              │                         │
          NO TOKEN                  HAS TOKEN
              │                         │
              ▼                         ▼
      ┌───────────────┐         ┌────────────┐
      │ Use Fallback  │         │  Fetch API │
      │     Data      │         └─────┬──────┘
      └───────────────┘               │
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                   SUCCESS                       ERROR
                        │                           │
                        ▼                           ▼
                ┌───────────────┐           ┌──────────────┐
                │ Transform &   │           │ Log Error &  │
                │  Set State    │           │ Use Fallback │
                └───────────────┘           └──────────────┘
                        │                           │
                        └───────────┬───────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │   Component   │
                            │ Always Works! │
                            └───────────────┘
```

## 📦 Component Hierarchy

```
App
 │
 ├─ Navbar
 │
 ├─ Hero
 │
 ├─ CarFilter ◄────────── useVehicles()
 │   │
 │   └─ VehicleList
 │       └─ VehicleCard
 │
 ├─ Booking4Seater ◄───── useVehicles()
 │   │
 │   ├─ BookingForm
 │   └─ CarDisplay
 │
 ├─ Booking7Seater ◄───── useVehicles()
 │   │
 │   ├─ BookingForm
 │   └─ CarDisplay
 │
 └─ Footer
```

## 🗂️ File Structure

```
src/
├── services/
│   └── vehicleService.js ◄─── API calls & data transformation
│
├── hooks/
│   └── useVehicles.js ◄────── Custom hook with state management
│
├── components/
│   ├── carData.js ◄────────── Fallback data
│   ├── CarFilter.jsx ◄─────── Uses hook
│   ├── Booking4Seater.jsx ◄── Uses hook
│   └── Booking7Seater.jsx ◄── Uses hook
│
└── examples/
    └── VehicleAPIExamples.jsx ◄─ Code examples
```

## 🔐 Authentication Flow

```
┌─────────────┐
│   User      │
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Auth API       │
│  /api/auth/login│
└──────┬──────────┘
       │
    Returns
  accessToken
       │
       ▼
┌─────────────────┐
│ localStorage    │
│ .setItem()      │
└──────┬──────────┘
       │
   Token stored
       │
       ▼
┌─────────────────┐
│ vehicleService  │
│ reads token     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ API Request     │
│ with Bearer     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Backend Auth    │
│ Validates token │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Returns Data    │
└─────────────────┘
```

## 📊 State Management

```
useVehicles Hook State:
┌───────────────────────────┐
│                           │
│  vehicles: []             │ ◄─── Array of vehicle objects
│  loading: boolean         │ ◄─── API call in progress?
│  error: string | null     │ ◄─── Error message if any
│  refetch: function        │ ◄─── Manually trigger reload
│                           │
└───────────────────────────┘
```

## 🎨 UI States

```
Component Lifecycle:

Initial State:
┌─────────────────┐
│    loading:     │
│      true       │
└────────┬────────┘
         │
         ▼

Loading UI:
┌─────────────────┐
│  "Đang tải..."  │
└────────┬────────┘
         │
         ▼

         API Call
         │
    ┌────┴────┐
    │         │
SUCCESS     ERROR
    │         │
    ▼         ▼

┌────────┐  ┌──────────┐
│ Data   │  │ Error +  │
│ Render │  │ Fallback │
└────────┘  └──────────┘
```

## 🔄 Refetch Pattern

```
User Action
    │
    ▼
┌─────────────┐
│   onClick   │
│  refetch()  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Set loading │
│    true     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Call   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Update data │
│ Set loading │
│    false    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Re-render  │
│  Component  │
└─────────────┘
```

## 💡 Benefits of This Architecture

1. **Separation of Concerns**
   - Components: UI logic
   - Hooks: State management
   - Services: API communication

2. **Reusability**
   - One hook used by multiple components
   - Service functions can be called directly if needed

3. **Testability**
   - Each layer can be tested independently
   - Mock service for hook tests
   - Mock hook for component tests

4. **Maintainability**
   - API changes only affect service layer
   - UI changes only affect component layer
   - State logic centralized in hook

5. **Flexibility**
   - Easy to add caching
   - Easy to add more endpoints
   - Easy to switch to different state management

6. **Error Resilience**
   - Fallback data ensures app always works
   - Graceful degradation
   - User-friendly error messages

---

**Legend:**
- `┌──┐` Boxes = Layers/Components
- `│` Vertical lines = Connection
- `▼` Arrows = Data/Control flow
- `◄─` Arrows = Uses/Imports
