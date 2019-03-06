# Discipl Core BaseConnector

A base class for discipl core connectors
Discipl Core does not work without connector modules that implement basic methods for given distributed ledger, verifiable credential or legacy platforms.  

Discipl core connector modules are automatically required, must extend the BaseConnector class (base-connector.js) and be available as module with a unique name: '@discipl/core-name' where name uniquely identifies the supported platform.

The BaseConnector class defines what the connector modules must implement. 

See the [Ephemeral Connector](https://www.github.com/discipl/discipl-core-ephemeral) for an example implementation of a connector.
