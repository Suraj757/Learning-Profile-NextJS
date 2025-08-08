# Educational Platform Security Architecture

## Authentication Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Teacher     │    │     Parent      │    │ School Admin    │
│   (JWT + MFA)   │    │  (JWT + Email)  │    │  (JWT + SAML)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Supabase Auth +      │
                    │   Custom Middleware    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Authorization API    │
                    │  (Role-Based Access)   │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────▼──────┐    ┌─────────▼──────┐    ┌─────────▼──────┐
    │ Classroom  │    │ Student Data   │    │ Audit Logging  │
    │ Management │    │ Protection     │    │ & Compliance   │
    └────────────┘    └────────────────┘    └────────────────┘
```

## User Roles & Permissions Matrix

| Resource | Teacher | Parent | Admin | Auditor |
|----------|---------|--------|-------|---------|
| Own Student Data | Read/Write | Read Only | Read Only | Read Only |
| Other Students | No Access | No Access | District Only | Read Only |
| Classroom Data | Own Classes | No Access | School Only | Read Only |
| System Logs | No Access | No Access | School Only | Full Access |
| Settings | Profile Only | Profile Only | School Config | No Access |