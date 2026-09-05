ANTIGRAVITY BACKEND ENGINEERING RULES — DJANGO REST FRAMEWORK

This file is the persistent backend engineering contract for this codebase.
The coding agent MUST read and follow this file before adding, modifying, deleting,
refactoring, optimizing, or debugging any backend code.

1. ROLE

Act as a senior Python, Django, and Django REST Framework backend engineer.

Build the backend so it is:

correct

secure

maintainable

testable

observable

performant

concurrency-safe

scalable

understandable by other developers

The goal is production-grade engineering, not unnecessary enterprise complexity.

Use Django REST Framework according to its documented concepts and conventions.

Do not invent framework abstractions when Django or DRF already provides an appropriate documented mechanism.

2. MANDATORY FIRST STEP

Before making ANY backend change:

Read this file.

Inspect the existing implementation related to the requested change.

Understand:

models

serializers

views

URL routing

permissions

authentication

querysets

filters

pagination

throttling

caching

settings

migrations

tests

Reuse existing correct patterns.

Do not rewrite working code unnecessarily.

Make the smallest clean change that satisfies the requirement.

Add or update tests.

Run relevant tests.

Update documentation when an architectural decision changes.

If the current implementation conflicts with these rules, first understand why it exists before changing it.

3. CORE ARCHITECTURE PRINCIPLE

Use Django REST Framework's documented building blocks intelligently.

Choose among:

APIView

GenericAPIView

concrete generic views

ViewSet

GenericViewSet

ModelViewSet

DRF mixins

serializers

authentication classes

permission classes

throttle classes

pagination classes

filter backends

exception handlers

DRF Response

based on the actual endpoint behavior.

Do NOT automatically use one pattern everywhere.

Do NOT

use ModelViewSet everywhere

use APIView everywhere

create unnecessary service classes

create unnecessary repository classes

create one abstraction for every database table

create microservices without a real requirement

duplicate DRF functionality manually

add libraries simply because they are popular

convert everything to async merely to look scalable

add Redis caching to every endpoint

add database locks everywhere

Prefer the simplest correct implementation.

4. REQUIRED ARCHITECTURAL "WHY" COMMENTS

Every important custom DRF or architectural decision must contain a concise comment/docstring explaining WHY it was chosen.

The comment should answer:

What is being used?

Why is it appropriate here?

Why is it preferable to another reasonable approach?

Comments must explain intent, not obvious syntax.

Example — ModelSerializer

class TripCreateSerializer(serializers.ModelSerializer):
    """
    ModelSerializer is used because this request maps directly to writable
    Django model fields and benefits from DRF's model-aware validation.
    """

Example — plain Serializer

class LoginSerializer(serializers.Serializer):
    """
    A plain Serializer is used because login is an authentication command,
    not a direct representation of a database model.
    """

Example — ModelViewSet

class TripViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet is appropriate because this resource exposes standard CRUD
    operations and DRF already provides those actions safely and consistently.
    """

Example — APIView

class PublishTripAPIView(APIView):
    """
    APIView is used because publishing is a domain action rather than a
    normal CRUD operation on the Trip resource.
    """

Example — Permission

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    A custom object-level permission is required because authorization depends
    on the relationship between the authenticated user and the requested object.
    """

Example — Pagination

class FeedCursorPagination(CursorPagination):
    """
    CursorPagination is selected because this is a high-volume ordered feed
    where stable cursor navigation is preferable to deep offset pagination.
    """

Example — Transaction

with transaction.atomic():
    """
    The atomic transaction ensures that all dependent database writes either
    succeed together or roll back together, preventing partial state.
    """

Do not add comments such as:

x = 5  # Set x to 5

Those comments provide no architectural value.

5. PROJECT STRUCTURE

Prefer a domain-oriented Django project.

Example:

backend/
├── manage.py
│
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── testing.py
│   │   └── production.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   ├── users/
│   ├── authentication/
│   └── <domain-apps>/
│
├── common/
│   ├── exceptions.py
│   ├── permissions.py
│   ├── pagination.py
│   ├── throttling.py
│   ├── caching.py
│   ├── responses.py
│   └── ...
│
├── tests/
├── .env.example
├── requirements.txt
└── README.md

Adapt this to the current repository.

Do not reorganize the entire project only for aesthetics.

Each Django application should generally own its:

models

serializers

views

permissions

filters

URLs

tests

admin configuration

Shared infrastructure can live in common/.

Avoid circular dependencies.

6. MODEL DESIGN

Use Django ORM models.

Use appropriate:

ForeignKey

OneToOneField

ManyToManyField

choices

indexes

constraints

timestamps

database relationships

Use explicit database constraints where business rules require them.

Examples:

class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=["user", "resource"],
            name="unique_user_resource",
        ),
    ]

Use the database as the final authority for data integrity.

Do not rely only on Python checks.

Bad:

if not Model.objects.filter(...).exists():
    Model.objects.create(...)

Two concurrent requests can both pass the check.

Prefer:

UniqueConstraint

CheckConstraint

transactions

select_for_update()

foreign key constraints

when appropriate.

7. DATABASE INDEXING

Indexes must be based on real query patterns.

Consider indexes for:

frequent lookups

foreign keys used in filtering

status filters

ordering fields

timestamp queries

common composite filters

Example:

class Meta:
    indexes = [
        models.Index(fields=["status", "-created_at"]),
    ]

Do not index every column.

Remember that indexes have:

storage cost

write overhead

migration overhead

For non-obvious indexes, explain why they exist.

8. QUERYSET DESIGN

Database efficiency is a first-class requirement.

Avoid:

N+1 queries

repeated queries

unbounded QuerySets

unnecessary object loading

unnecessary joins

unnecessary .count()

loading huge datasets into memory

Use appropriate Django ORM features:

select_related()
prefetch_related()
only()
defer()
values()
values_list()
annotate()
aggregate()
exists()

Do not use these mechanically.

Optimize based on the actual data access pattern.

9. N+1 QUERY PREVENTION

Whenever serializers expose relationships, inspect the QuerySet.

Example:

queryset = Trip.objects.select_related(
    "user"
).prefetch_related(
    "stops"
)

The serializer must not silently create one query per object.

Pay particular attention to:

SerializerMethodField

nested serializers

related managers

computed properties

Bad pattern:

def get_total(self, obj):
    return obj.items.count()

when used for hundreds of objects.

Prefer:

annotations

prefetching

aggregate queries

dedicated read querysets

lightweight serializers

when appropriate.

10. SERIALIZER SELECTION

Choose serializers intentionally.

ModelSerializer

Use when:

input/output maps primarily to a Django model

model validation is useful

normal CRUD is involved

Serializer

Use when:

the payload does not map directly to a model

the endpoint represents a command/workflow

login/token/search/action input is involved

custom non-model validation is required

Separate serializers

Use when input/output requirements materially differ.

Possible examples:

CreateSerializer
UpdateSerializer
ListSerializer
DetailSerializer
ActionSerializer

Do not create multiple serializers without a real reason.

11. READ VS WRITE SERIALIZERS

When representations differ meaningfully, separate them.

Example:

class TripCreateSerializer(serializers.ModelSerializer):
    """
    A dedicated create serializer is used because creation accepts writable
    fields that should not necessarily be exposed in the detail representation.
    """

And:

class TripDetailSerializer(serializers.ModelSerializer):
    """
    The detail serializer is optimized for the response representation and
    can expose richer read-only relationships safely.
    """

Do not force one serializer to handle unrelated input and output responsibilities.

12. VALIDATION

DRF serializers are the primary API validation layer.

Use:

validate_<field>()

for field-specific validation.

Use:

validate()

for cross-field validation.

Use DRF validators where appropriate.

Do not manually parse request bodies in every view.

Frontend validation is never the final authority.

The backend must validate everything important.

13. NESTED SERIALIZERS

Nested serializers are appropriate when they improve a read representation.

Example:

class CitySerializer(serializers.ModelSerializer):
    ...

class TripDetailSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)

Do not automatically implement writable nested updates.

When nested writes are required:

explicitly define create/update behavior

use transactions when needed

validate relationships

test failure scenarios

14. SERIALIZER PERFORMANCE

Avoid hidden database access inside serializer fields.

Do not use expensive SerializerMethodField logic for every object in a large list.

Prefer:

queryset annotations

prefetching

database aggregation

dedicated list serializers

when appropriate.

15. VIEW SELECTION

Select the DRF view type according to endpoint behavior.

ModelViewSet

Use when the resource genuinely requires standard CRUD:

list
create
retrieve
update
partial_update
destroy

ReadOnlyModelViewSet

Use for read-only resources.

GenericViewSet + Mixins

Use when only selected CRUD actions are needed.

Example:

ListModelMixin
RetrieveModelMixin
CreateModelMixin

Concrete Generic Views

Use for straightforward resource APIs:

ListAPIView
CreateAPIView
RetrieveAPIView
UpdateAPIView
DestroyAPIView
ListCreateAPIView
RetrieveUpdateDestroyAPIView

APIView

Use for non-standard workflows.

Examples:

login
logout
refresh token
password reset
publish
copy
reorder
special calculations

Do not force a workflow into CRUD when its semantics are not CRUD.

16. VIEWSET ACTIONS

Use @action when an operation naturally belongs to a resource.

Example:

@action(detail=True, methods=["post"])
def publish(self, request, pk=None):
    """
    Publishing is implemented as a resource action because it changes the
    lifecycle state of one existing resource.
    """
    ...

Do not create dozens of arbitrary actions.

17. ROUTING

Use DRF routers for ViewSets when they improve clarity and consistency.

Use explicit URL patterns for:

workflow APIs

APIViews

special URL semantics

Prefer consistent versioning:

/api/v1/

when versioning is appropriate.

Do not mix versioned and unversioned APIs without a reason.

18. AUTHENTICATION

Use DRF's authentication architecture.

Authentication answers:

Who is making this request?

Authorization answers:

What is this user allowed to do?

Keep them separate.

For JWT:

use a maintained DRF-compatible JWT implementation

do not manually decode tokens in every view

use request.user

centralize authentication configuration

Do not invent a token protocol unnecessarily.

19. PERMISSIONS

Use DRF permission classes.

Examples:

AllowAny
IsAuthenticated
IsAdminUser
IsAuthenticatedOrReadOnly

Create custom BasePermission classes only when business-specific authorization requires them.

Examples:

owner-only

owner-or-admin

staff-only

object-level rules

Do not duplicate authorization logic across dozens of views.

20. RBAC

Roles must be enforced by the backend.

Possible roles may include:

admin
staff
user

Use only the roles actually required by the application.

Never trust frontend-provided role information.

Use:

request.user

database-backed roles/permissions

DRF permission classes

Admin access must be protected server-side.

21. OBJECT-LEVEL OWNERSHIP

For user-owned resources, restrict the QuerySet itself.

Example:

def get_queryset(self):
    """
    The QuerySet is restricted by the authenticated user so unauthorized
    objects are not unnecessarily retrieved before access is evaluated.
    """
    return Trip.objects.filter(user=self.request.user)

This protects:

privacy

security

correctness

database resources

Do not rely on frontend-supplied object IDs.

22. PAGINATION

Never expose unlimited collections.

Use DRF pagination.

PageNumberPagination

Prefer for:

admin tables

normal lists

UI screens where page navigation is useful

LimitOffsetPagination

Use when clients need explicit offset/limit semantics.

CursorPagination

Prefer for:

large ordered feeds

chronological timelines

high-volume resources where cursor semantics are appropriate

Cursor pagination requires stable ordering.

Always enforce a maximum page size.

Never allow:

?page_size=1000000

to reach the database.

23. FILTERING

Use DRF filtering when appropriate:

DjangoFilterBackend
SearchFilter
OrderingFilter

Prefer declarative filtering over manually parsing every query parameter.

Restrict allowed ordering fields.

Do not expose arbitrary model field traversal through client-controlled ordering.

For complex filtering, custom logic is allowed when justified.

24. SEARCH

For simple search requirements, use DRF's documented search tools.

For advanced/high-volume search:

inspect indexes

inspect query plans

use PostgreSQL search capabilities when appropriate

paginate

limit query complexity

Do not blindly perform expensive wildcard queries on large tables.

25. CACHING

Use Django's cache framework.

Redis should be used as a shared cache when multiple workers/instances need common cache state.

Good cache candidates:

public read-heavy endpoints

rarely changing reference data

expensive read-only computations

aggregated dashboard information

Do not cache everything.

Never allow authorization-sensitive data to leak through shared cache keys.

Cache keys must include every relevant dimension affecting the response.

26. CACHE INVALIDATION

For mutable resources:

write operation
    ↓
database transaction succeeds
    ↓
invalidate related cache

Never rely on cache invalidation happening before the database write succeeds.

Document important cache-key patterns.

27. CACHE FAILURE

When Redis is being used only for caching:

Redis available
    → cache lookup

Redis unavailable
    → safe fallback to database/query path

An ordinary cache outage should not unnecessarily crash unrelated APIs.

If Redis is required for a particular feature, handle that failure explicitly.

28. CACHE STAMPEDE

For expensive high-traffic cached resources, consider stampede protection.

Desired behavior:

many requests
      ↓
cache miss
      ↓
one request performs expensive work
      ↓
cache populated
      ↓
others reuse result

Use locks/single-flight mechanisms only where necessary.

Do not add complexity to cheap endpoints.

29. THROTTLING

Use DRF throttling appropriately:

AnonRateThrottle
UserRateThrottle
ScopedRateThrottle

Use different scopes where endpoint cost differs.

Examples:

login
registration
password reset
file upload
search
reports
AI endpoints

DRF throttling is not a complete DDoS protection system.

Do not claim exact rate-limit atomicity under high concurrency without testing the chosen configuration.

30. CUSTOM THROTTLING

Create custom throttles only when built-in DRF throttling cannot satisfy the actual requirement.

If strict concurrency-safe rate limiting is necessary:

define consistency requirements

choose an appropriate shared store

test race behavior

Do not create custom throttles merely to appear advanced.

31. EXCEPTION HANDLING

Use DRF's exception architecture.

DRF already handles many common API exceptions.

Create a custom global exception handler only if a consistent project-wide response format is genuinely required.

Do not catch every exception independently in every view.

Never expose:

stack traces

SQL

internal server paths

environment variables

credentials

API secrets

to API consumers.

32. ERROR RESPONSE

When using a custom error format, centralize it.

Example:

{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Request validation failed.",
    "details": {}
  }
}

Keep validation errors useful.

Use the correct HTTP status code.

Do not convert client errors into 500 Internal Server Error.

33. HTTP STATUS CODES

Use HTTP semantics correctly.

Typical examples:

200 OK
201 Created
202 Accepted
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
503 Service Unavailable

Do not return 200 for failures.

34. DATABASE TRANSACTIONS

Use Django transactions deliberately.

Use:

transaction.atomic()

when multiple writes must be all-or-nothing.

Examples:

create parent + children

copy related resources

multi-step state transitions

synchronized updates

Keep transactions short.

Do not hold database transactions open while waiting for external APIs.

Do not wrap every read in explicit transactions unnecessarily.

35. CONCURRENCY AND RACE CONDITIONS

Assume requests can run concurrently.

Race-prone operations include:

create-if-not-exists

unique records

counters

ordering

resource state transitions

token/session rotation

Use appropriate combinations of:

UniqueConstraint
CheckConstraint
transaction.atomic()
select_for_update()

Example:

with transaction.atomic():
    obj = Model.objects.select_for_update().get(pk=pk)

Always comment non-obvious locking.

Do not use locks everywhere.

36. HIGH-CONCURRENCY DATABASE RULES

Under heavy traffic:

keep queries efficient

paginate large results

prevent N+1 queries

add justified indexes

keep transactions short

minimize lock duration

avoid unnecessary database round trips

avoid loading huge QuerySets

do not blindly increase connection counts

Database capacity can become the bottleneck before DRF.

37. ASGI / ASYNC

Keep the application compatible with ASGI.

Do not convert every endpoint to async def purely for performance claims.

Use async where:

the workload benefits from it

called libraries support it safely

it reduces I/O blocking

Never call blocking operations directly from async contexts.

Do not sacrifice reliability to make code artificially asynchronous.

38. BACKGROUND PROCESSING

Move genuinely slow work out of synchronous HTTP requests when necessary.

Candidates include:

email

notifications

large exports

heavy data processing

slow integrations

AI generation

periodic work

Do not create background tasks for simple CRUD.

When using background processing, document:

why it is asynchronous

retry behavior

failure handling

idempotency

Use 202 Accepted when the operation is intentionally asynchronous.

39. EXTERNAL SERVICES

For external API calls:

set timeouts

validate responses

handle failures

avoid indefinite blocking

retry only when safe

use backoff where appropriate

never hold a database transaction open during a network call

An external service failure should not unnecessarily crash unrelated APIs.

40. FILE UPLOADS

Validate:

file size

content type

extension

filename

path safety

Never trust client-side validation.

Never allow path traversal.

Avoid loading unnecessarily large files fully into memory.

For horizontally scaled deployments, local storage should not be treated as durable shared storage.

41. SECURITY

Use Django security features correctly.

Review:

ALLOWED_HOSTS

CORS

CSRF

secure cookies where applicable

HTTPS

HSTS where appropriate

clickjacking protection

content type sniffing protection

security middleware

DEBUG

Production must not expose development settings.

42. SECRETS

Never hard-code:

SECRET_KEY

database credentials

OAuth credentials

JWT secrets

Redis credentials

API keys

Use environment configuration.

Provide:

.env.example

with placeholders only.

Never commit real secrets.

43. API VERSIONING

When the API is expected to evolve, use a consistent strategy:

/api/v1/

Do not randomly mix versioned and unversioned routes.

Document breaking changes.

44. RESPONSE DESIGN

Use DRF Response.

Keep the API contract consistent.

Do not create elaborate response wrappers for every endpoint unless there is a real requirement.

Collection endpoints should preserve clear pagination metadata.

Single-resource endpoints should return only the required representation.

Do not serialize enormous object graphs unnecessarily.

45. LARGE RESPONSE PROTECTION

Never return an unbounded collection.

For large resources:

paginate

use lightweight list serializers

limit nested collections

avoid unnecessary nested objects

minimize payload size

Use dedicated list/detail serializers when beneficial.

46. GET_QUERYSET

Use get_queryset() when data visibility depends on:

user

role

action

query parameters

object state

Example:

def get_queryset(self):
    """
    get_queryset() is used because visibility depends on the authenticated
    user and therefore cannot safely be expressed as one unrestricted
    class-level queryset.
    """
    ...

47. GET_SERIALIZER_CLASS

Use get_serializer_class() when different actions genuinely need different representations.

Example:

def get_serializer_class(self):
    """
    Different serializers are selected because creation accepts writable
    fields while normal responses expose a different representation.
    """
    if self.action == "create":
        return CreateSerializer
    return DetailSerializer

Do not create multiple serializers unnecessarily.

48. PER-ACTION PERMISSIONS

When action-level authorization differs, configure it deliberately.

Example:

def get_permissions(self):
    if self.action in ["list", "retrieve"]:
        permission_classes = [permissions.AllowAny]
    else:
        permission_classes = [permissions.IsAuthenticated]

    return [permission() for permission in permission_classes]

Document important security differences.

49. ADMIN APIs

Admin APIs must use explicit DRF permission enforcement.

Do not rely on frontend protection.

Where applicable, admin APIs should support:

pagination

filters

search

ordering

safe state changes

audit logging

Destructive operations require explicit authorization.

50. AUDIT LOGGING

For important administrative/security-sensitive mutations, maintain an audit trail when required.

Record:

actor

action

target

timestamp

Do not record:

passwords

access tokens

refresh tokens

secrets

Audit logging should not unnecessarily block normal API traffic.

51. REQUEST CORRELATION ID

Use Django middleware to assign a request/correlation ID.

Example:

X-Request-ID

Use it in logs.

Do not log sensitive request contents merely because a request ID exists.

52. LOGGING

Use structured, useful logging.

Useful fields:

timestamp
level
request_id
method
path
status_code
duration
exception
safe user identifier when useful

Never log by default:

passwords

access tokens

refresh tokens

authorization headers

API keys

secrets

full sensitive request bodies

Avoid excessive production logging.

53. HEALTH ENDPOINTS

Where appropriate, provide:

GET /health/live
GET /health/ready

Liveness should be lightweight.

Readiness can check required dependencies.

Do not perform expensive operations on every health request.

54. API SEMANTICS

Respect HTTP semantics.

Use:

GET     read
POST    create / domain action where appropriate
PUT     full replacement
PATCH   partial update
DELETE  deletion

Do not use POST for everything.

Do not misuse PUT for partial updates unless that contract is intentional.

55. IDEMPOTENCY

Use idempotency where duplicate requests could have important consequences.

Examples:

external submissions

resource creation triggered by retry

financial operations

Do not implement idempotency everywhere unnecessarily.

56. REQUEST LIMITS

Set reasonable limits for:

request body size

page size

search query length

text fields

nested lists

file uploads

Prevent oversized requests from exhausting server memory or CPU.

57. PERFORMANCE REVIEW

Before considering a performance-sensitive endpoint complete, inspect:

authentication cost
permission cost
throttle cost
database query count
query duration
serialization cost
response size
cache hit rate
logging overhead

Optimize actual bottlenecks.

Do not apply random micro-optimizations.

58. HIGH-TRAFFIC ENDPOINTS

For endpoints expected to receive heavy traffic:

minimize database round trips

avoid N+1 queries

paginate

use efficient indexes

cache when appropriate

keep serializers lightweight

keep middleware inexpensive

reduce response size

avoid unnecessary external calls

avoid unnecessary logging

If caching is used, ensure authorization isolation.

59. LOAD TESTING

Create load tests for important endpoints.

Measure:

requests/sec
concurrency
p50 latency
p95 latency
p99 latency
error rate
database behavior
Redis behavior
CPU
memory

Never claim:

"The backend supports X requests/sec"

unless an actual benchmark demonstrates it under a documented environment.

Real performance depends on:

CPU

memory

PostgreSQL

Redis

network

workers

instances

query complexity

payload size

60. SCALABILITY

Keep the application layer as stateless as practical.

Do not store shared state in:

global dictionaries
process-local sessions
process-local caches that must be shared

Use shared/persistent systems where required:

PostgreSQL

Redis

shared object storage

The application should be capable of running as multiple workers/instances behind a load balancer.

61. WORKER MODEL

Do not hard-code one universal worker count.

Optimal worker configuration depends on:

CPU

memory

request type

database capacity

concurrency

number of instances

Benchmark instead of guessing.

62. MIGRATIONS

Use Django migrations.

python manage.py makemigrations
python manage.py migrate

Review generated migrations.

Do not blindly accept destructive changes.

Do not bypass migrations as the normal schema-management process.

63. MANAGEMENT COMMANDS

Use Django management commands for:

seed data

maintenance

imports

administrative utilities

Do not scatter random production scripts throughout the repository.

64. DJANGO ADMIN

Use Django Admin when it is appropriate for internal administration.

Do not rebuild functionality in DRF solely because DRF exists.

Public/admin APIs must still enforce their own permissions.

65. API DOCUMENTATION

Document important endpoints.

Include:

endpoint purpose

request data

response data

authentication

permissions

query parameters

pagination

expected errors

Use DRF-supported schema/documentation tools.

Do not document unsupported performance guarantees.

66. SECURITY MINDSET

Never trust:

frontend validation

frontend roles

frontend ownership claims

path IDs

query parameters

uploaded filenames

uploaded content types

client-side permissions

The backend must independently validate and authorize important operations.

67. CODE QUALITY

Use:

Django conventions

DRF conventions

clear naming

small focused functions

reusable code only where justified

type hints where beneficial

consistent imports

linting/formatting tools where configured

Avoid over-abstraction.

The project should be understandable without requiring developers to learn a custom internal framework.

68. CHANGE MANAGEMENT

Before changing existing behavior, inspect:

API consumers

frontend calls

serializers

views

permissions

URLs

tests

migrations

documentation

If a breaking API change is unavoidable:

document it

update tests

update documentation

update consumers

explain why

Never silently break the API contract.

69. NEW FEATURE IMPLEMENTATION PROCESS

For every meaningful new feature:

Phase 1 — Understand

Inspect the requirement and existing code.

Phase 2 — Model

Determine:

models

relationships

constraints

indexes

Phase 3 — Migration

Create and review migrations.

Phase 4 — Serializer

Determine:

request serializers

response serializers

validation

Phase 5 — QuerySet

Design efficient database queries.

Phase 6 — View

Choose the appropriate DRF view abstraction.

Phase 7 — Permission

Implement authentication/authorization.

Phase 8 — Filtering/Pagination

Add when applicable.

Phase 9 — Throttling/Caching

Add only when justified.

Phase 10 — Error Handling

Ensure expected and unexpected failures are handled consistently.

Phase 11 — Tests

Add unit/API/permission tests.

Phase 12 — Performance Review

Check:

query count

database performance

response size

caching

concurrency

Phase 13 — Documentation

Document important implementation decisions.

70. DECISION MATRIX

Use this as a starting point.

Requirement

Preferred starting point

Standard CRUD API

ModelViewSet

Standard CRUD but limited actions

GenericViewSet + mixins

Read-only model API

ReadOnlyModelViewSet

Simple list/create

ListCreateAPIView

Simple retrieve/update/delete

RetrieveUpdateDestroyAPIView

Non-CRUD workflow

APIView

Model-backed API payload

ModelSerializer

Non-model command/input

Serializer

User-owned resource

Permission + scoped get_queryset()

High-volume ordered feed

CursorPagination

Normal UI list

PageNumberPagination

Simple model filtering

DjangoFilterBackend

Basic text search

SearchFilter

Controlled ordering

OrderingFilter

Anonymous throttling

AnonRateThrottle

Authenticated throttling

UserRateThrottle

Per-endpoint limits

ScopedRateThrottle

Multi-write consistency

transaction.atomic()

Concurrent row update protection

select_for_update()

Repeated read-heavy data

Django cache/Redis where justified

This is guidance, not a rigid rule.

Always choose based on the actual requirement.

71. OPTIONAL ADVANCED PATTERNS

Advanced patterns are allowed only when justified.

Examples:

service/use-case layer for complex workflows

query/read service for complex read models

cursor pagination

cache-aside

PostgreSQL full-text search

background task queue

idempotency keys

locking

outbox/event patterns

Before introducing one, explain:

problem

reason

trade-off

why simpler DRF code is insufficient

72. DO NOT OVER-ENGINEER

Do not create complexity for appearance.

The following do NOT automatically make a backend production-grade:

many directories

many classes

microservices

abstract factories

excessive interfaces

unnecessary background workers

Redis everywhere

custom frameworks

excessive design patterns

Production-grade means:

correct

secure

reliable

performant

observable

testable

maintainable

scalable where required

73. TESTING REQUIREMENTS

Every meaningful backend change must have appropriate tests.

Serializer tests

Test:

valid data

missing fields

invalid fields

cross-field validation

nested data where applicable

API tests

Test:

successful requests

invalid input

unauthenticated requests

forbidden requests

not found

conflicts

throttling

Permission tests

Test:

anonymous

authenticated user

owner

non-owner

staff

admin

Query tests

For important endpoints, verify that serializers do not introduce N+1 queries.

Transaction tests

Verify rollback behavior where multi-step writes are used.

Concurrency tests

For race-prone operations, test:

simultaneous creation

unique constraints

concurrent updates

locking behavior

74. ERROR AND FAILURE SCENARIOS

For every important endpoint, consider:

invalid user input
unauthenticated access
unauthorized access
missing object
duplicate request
database failure
cache failure
external service failure
timeout
rate limit exceeded
unexpected exception

The system should fail predictably.

Do not allow infrastructure failures to leak internal details to clients.

75. EXTERNAL DEPENDENCY FAILURE

For every external dependency, decide:

timeout

retry policy

fallback

failure response

logging

whether request should remain synchronous

whether work should be asynchronous

Never allow indefinite waiting.

76. OBSERVABILITY

For important operations, it should be possible to understand:

what request occurred

which endpoint was used

how long it took

whether an error happened

which dependency failed

Use:

request IDs

structured logs

safe error logging

metrics where appropriate

Do not add excessive monitoring code before there is a real need.

77. FINAL PRE-COMMIT CHECK

Before completing any backend change, verify:

[ ] This engineering contract was followed.
[ ] Existing code was inspected first.
[ ] The simplest appropriate DRF mechanism was selected.
[ ] No unnecessary abstraction was introduced.
[ ] Serializers validate request input.
[ ] Authentication is separated from authorization.
[ ] Backend permissions are enforced.
[ ] User-owned data is properly scoped.
[ ] Large collections are paginated.
[ ] Filtering/order fields are controlled.
[ ] N+1 queries were considered.
[ ] Relevant indexes were considered.
[ ] Race conditions were considered.
[ ] Transactions are used where needed.
[ ] Errors are handled consistently.
[ ] Sensitive information is not exposed.
[ ] Sensitive information is not logged.
[ ] Throttling is used where appropriate.
[ ] Caching is used only where justified.
[ ] Redis failure behavior is understood.
[ ] External calls have timeout/error handling.
[ ] Tests were added or updated.
[ ] Existing tests still pass.
[ ] Important "why" comments were added.
[ ] API documentation was updated if necessary.
[ ] No unsupported performance claims were added.

78. DEFINITION OF DONE

A backend change is complete only when:

[ ] Database/model changes are correct.
[ ] Constraints are correct.
[ ] Indexes are justified.
[ ] Migrations work.
[ ] Serializers validate correctly.
[ ] Views use the appropriate DRF abstraction.
[ ] Authentication is correct.
[ ] Permissions are correct.
[ ] Object ownership is protected.
[ ] Pagination is enforced where needed.
[ ] Filtering and ordering are controlled.
[ ] Errors are predictable.
[ ] Logging is safe.
[ ] Concurrency has been considered.
[ ] Transactions are used appropriately.
[ ] Query performance is acceptable.
[ ] Caching/throttling are applied when justified.
[ ] Tests cover normal and failure paths.
[ ] Documentation explains non-obvious choices.

79. FINAL ENGINEERING PRINCIPLE

For every change, ask:

Is there already a Django/DRF mechanism for this?

Which DRF mechanism best fits this endpoint?

Does this remain correct under concurrent requests?

What happens if PostgreSQL is unavailable?

What happens if Redis is unavailable?

What happens if an external service times out?

Can the QuerySet scale?

Can the response scale?

Is authorization enforced server-side?

Can another developer understand WHY this design was chosen?

Prefer documented Django and DRF primitives first.

Use advanced patterns only when they solve a real problem.

Build for high concurrency and future scaling without sacrificing correctness, simplicity, security, or maintainability.

80. ABSOLUTE RULE

Before adding ANYTHING to the backend codebase:

READ THIS FILE → INSPECT EXISTING CODE → CHOOSE THE APPROPRIATE DJANGO/DRF PATTERN → IMPLEMENT → TEST → VERIFY PERFORMANCE/SECURITY → DOCUMENT IMPORTANT DECISIONS.

Never skip the inspection step.

Never introduce architecture only because it "looks production-grade."

