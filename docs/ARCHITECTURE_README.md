# FMEssentials Solution Structure

This solution follows **Clean Architecture** principles with clear separation of concerns.

## Project Structure

```
C:\Hackathon\
├── FMEssentials.API\          # API/Presentation Layer
│   ├── Program.cs             # Application entry point
│   ├── appsettings.json       # Configuration
│   └── Controllers\           # API Controllers (to be added)
│
├── FMEssentials.Application\  # Application Layer
│   ├── Interfaces\            # Repository and service interfaces
│   └── Services\              # Business logic services (to be added)
│
├── FMEssentials.Domain\       # Domain Layer
│   ├── Entities\              # Domain entities
│   └── Enums\                 # Domain enumerations
│
└── FMEssentials.Infrastructure\ # Infrastructure Layer
    ├── Data\                  # DbContext and configurations (to be added)
    ├── Repositories\          # Repository implementations (to be added)
    └── Services\              # External service implementations (to be added)
```

## Layer Dependencies

Following Clean Architecture dependency rules:

- **Domain** - No dependencies (core business entities and logic)
- **Application** - Depends on Domain (business use cases and interfaces)
- **Infrastructure** - Depends on Application and Domain (implementation details)
- **API** - Depends on Application and Infrastructure (presentation and composition root)

## Key Principles

1. **Dependency Inversion**: All layers depend on abstractions (interfaces) defined in the Application layer
2. **Separation of Concerns**: Each layer has a single, well-defined responsibility
3. **Testability**: Business logic is isolated and can be tested independently
4. **Flexibility**: Infrastructure details can be swapped without affecting business logic

## Build Order

The projects build in this order:
1. FMEssentials.Domain
2. FMEssentials.Application
3. FMEssentials.Infrastructure
4. FMEssentials.API
