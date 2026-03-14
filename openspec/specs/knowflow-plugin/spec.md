# knowflow-plugin Specification

## Purpose
TBD - created by archiving change knowflow-openclaw-plugin. Update Purpose after archive.
## Requirements
### Requirement: Agent Tool - knowflow_record
The plugin SHALL register an agent tool that creates a KnowFlow item with OpenClaw attributes in one call.

#### Scenario: Record a document
- GIVEN the plugin is loaded and KnowFlow is running
- WHEN Agent calls knowflow_record with name, projectId, type, summary, content, agent
- THEN the plugin creates an item via POST /api/v1/item
- AND sets OpenClaw attributes via PUT /api/v1/plugins/knowflow_openclaw/items/{id}/openclaw
- AND returns the item id and status

### Requirement: Agent Tool - knowflow_search
The plugin SHALL register an agent tool that searches KnowFlow items.

#### Scenario: Search by keyword
- GIVEN KnowFlow has items
- WHEN Agent calls knowflow_search with query
- THEN the plugin calls GET /api/v1/item/search and returns matching items

### Requirement: Agent Tool - knowflow_list
The plugin SHALL register an agent tool that lists recent KnowFlow items.

#### Scenario: List recent items
- GIVEN KnowFlow has items
- WHEN Agent calls knowflow_list with optional limit
- THEN the plugin returns recent items sorted by creation time

### Requirement: Agent Tool - knowflow_get
The plugin SHALL register an agent tool that retrieves a single KnowFlow item by id.

#### Scenario: Get item detail
- GIVEN an item id exists
- WHEN Agent calls knowflow_get with id
- THEN the plugin returns the full item with attributes

### Requirement: Plugin Manifest
The plugin SHALL have a valid openclaw.plugin.json with configSchema for baseUrl.

#### Scenario: Configure base URL
- GIVEN the plugin is installed
- WHEN user sets config.baseUrl to a custom URL
- THEN all API calls use that URL instead of default

