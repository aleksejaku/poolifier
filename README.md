<div align="center">
  <img src="./images/logo.png" width="340px" height="266px"/>
</div>

<h1 align="center">Node.js Worker_Threads and Cluster Worker Pool</h1>

<p align="center">
  <a href="https://github.com/poolifier/poolifier/graphs/commit-activity">
    <img alt="GitHub commit activity (master)" src="https://img.shields.io/github/commit-activity/m/poolifier/poolifier/master"></a>
  <a href="https://www.npmjs.com/package/poolifier">
    <img alt="Weekly Downloads" src="https://img.shields.io/npm/dw/poolifier"></a>
  <a href="https://github.com/poolifier/poolifier/actions/workflows/ci.yml">
    <img alt="Actions Status" src="https://github.com/poolifier/poolifier/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://sonarcloud.io/dashboard?id=pioardi_poolifier">
    <img alt="Code Coverage" src="https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=coverage"></a>
  <a href="https://sonarcloud.io/dashboard?id=pioardi_poolifier">
    <img alt="Quality Gate Status" src="https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=alert_status"></a>
  <a href="https://standardjs.com">
    <img alt="Javascript Standard Style Guide" src="https://img.shields.io/badge/code_style-standard-brightgreen.svg"></a>
  <a href="https://gitter.im/poolifier/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge">
    <img alt="Gitter chat" src="https://badges.gitter.im/poolifier/community.svg"></a>
  <a href="https://opencollective.com/poolifier">
    <img alt="Open Collective" src="https://opencollective.com/poolifier/tiers/badge.svg"></a>
  <a href="http://makeapullrequest.com">
    <img alt="PR Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square"></a>
  <a href="https://img.shields.io/static/v1?label=dependencies&message=no%20dependencies&color=brightgreen">
    <img alt="No dependencies" src="https://img.shields.io/static/v1?label=dependencies&message=no%20dependencies&color=brightgreen"></a>
</p>

## Why Poolifier?

Poolifier is used to perform CPU and/or I/O intensive tasks on Node.js servers, it implements worker pools using [worker_threads](https://nodejs.org/api/worker_threads.html) and [cluster](https://nodejs.org/api/cluster.html) Node.js modules.  
With poolifier you can improve your **performance** and resolve problems related to the event loop.  
Moreover you can execute your tasks using an API designed to improve the **developer experience**.  
Please consult our [general guidelines](#general-guidelines).

- Easy to use :white_check_mark:
- Performance [benchmarks](./benchmarks/README.md) :white_check_mark:
- Fixed and dynamic pool size :white_check_mark:
- Easy switch from a pool type to another :white_check_mark:
- No runtime dependencies :white_check_mark:
- Proper integration with node [async_hooks](https://nodejs.org/api/async_hooks.html) :white_check_mark:
- Support CommonJS, ESM, and TypeScript :white_check_mark:
- Support for [worker_threads](https://nodejs.org/api/worker_threads.html) and [cluster](https://nodejs.org/api/cluster.html) Node.js modules :white_check_mark:
- Support multiple task functions :white_check_mark:
- Support sync and async task functions :white_check_mark:
- Tasks distribution strategies :white_check_mark:
- General guidelines on pool choice :white_check_mark:
- Error handling out of the box :white_check_mark:
- Widely tested :white_check_mark:
- Active community :white_check_mark:
- Code quality [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=bugs)](https://sonarcloud.io/dashboard?id=pioardi_poolifier)
  [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=code_smells)](https://sonarcloud.io/dashboard?id=pioardi_poolifier)
  [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=pioardi_poolifier)
  [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=pioardi_poolifier)
  [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=pioardi_poolifier)
  [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=sqale_index)](https://sonarcloud.io/dashboard?id=pioardi_poolifier)
- Code security [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=security_rating)](https://sonarcloud.io/dashboard?id=pioardi_poolifier) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=pioardi_poolifier&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=pioardi_poolifier)

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Node versions](#node-versions)
- [API](#api)
- [General guidelines](#general-guidelines)
- [Worker choice strategies](#worker-choice-strategies)
- [Contribute](#contribute)
- [Team](#team)
- [License](#license)

## Overview

Poolifier contains two [worker_threads](https://nodejs.org/api/worker_threads.html#class-worker)/[cluster](https://nodejs.org/api/cluster.html#cluster_class_worker) worker pool implementations, you don't have to deal with [worker_threads](https://nodejs.org/api/worker_threads.html)/[cluster](https://nodejs.org/api/cluster.html) complexity.  
The first implementation is a fixed worker pool, with a defined number of workers that are started at creation time and will be reused.  
The second implementation is a dynamic worker pool, with a number of worker started at creation time (these workers will be always active and reused) and other workers created when the load will increase (with an upper limit, these workers will be reused when active), the new created workers will be stopped after a configurable period of inactivity.  
You have to implement your worker by extending the _ThreadWorker_ or _ClusterWorker_ class.

## Installation

```shell
npm install poolifier --save
```

## Usage

You can implement a [worker_threads](https://nodejs.org/api/worker_threads.html#class-worker) worker in a simple way by extending the class _ThreadWorker_:

```js
'use strict'
const { ThreadWorker } = require('poolifier')

function yourFunction(data) {
  // this will be executed in the worker thread,
  // the data will be received by using the execute method
  return { ok: 1 }
}

module.exports = new ThreadWorker(yourFunction, {
  maxInactiveTime: 60000
})
```

Instantiate your pool based on your needs :

```js
'use strict'
const { DynamicThreadPool, FixedThreadPool, PoolEvents, availableParallelism } = require('poolifier')

// a fixed worker_threads pool
const pool = new FixedThreadPool(availableParallelism(), './yourWorker.js', {
  errorHandler: e => console.error(e),
  onlineHandler: () => console.info('worker is online')
})

pool.emitter.on(PoolEvents.ready, () => console.info('Pool is ready'))
pool.emitter.on(PoolEvents.busy, () => console.info('Pool is busy'))

// or a dynamic worker_threads pool
const pool = new DynamicThreadPool(Math.floor(availableParallelism() / 2), availableParallelism(), './yourWorker.js', {
  errorHandler: e => console.error(e),
  onlineHandler: () => console.info('worker is online')
})

pool.emitter.on(PoolEvents.full, () => console.info('Pool is full'))
pool.emitter.on(PoolEvents.ready, () => console.info('Pool is ready'))
pool.emitter.on(PoolEvents.busy, () => console.info('Pool is busy'))

// the execute method signature is the same for both implementations,
// so you can easy switch from one to another
pool
  .execute()
  .then(res => {
    console.info(res)
  })
  .catch(err => {
    console.error(err)
  })
```

You can do the same with the classes _ClusterWorker_, _FixedClusterPool_ and _DynamicClusterPool_.

**See [examples](./examples/) folder for more details**:

- [Javascript](./examples/javascript/)
- [Typescript](./examples/typescript/)
  - [HTTP client pool](./examples/typescript/http-client-pool/)
  - [HTTP server pool](./examples/typescript/http-server-pool/)
    - [Express](./examples/typescript/http-server-pool/express/)
    - [Fastify](./examples/typescript/http-server-pool/fastify/)
  - [Websocket server pool](./examples/typescript/websocket-server-pool/)
    - [ws](./examples/typescript/websocket-server-pool/ws/)

Remember that workers can only send and receive structured-cloneable data.

## Node versions

Node versions >= 16.14.x are supported.

## [API](./docs/api.md)

## [General guidelines](./docs/general-guidelines.md)

## [Worker choice strategies](./docs/worker-choice-strategies.md)

## Contribute

Choose your task here [2.6.x](https://github.com/orgs/poolifier/projects/1), propose an idea, a fix, an improvement.

See [CONTRIBUTING](CONTRIBUTING.md) guidelines.

## Team

**Creator/Owner:**

- [**Alessandro Pio Ardizio**](https://github.com/pioardi)

**_Contributors_**

- [**Shinigami92**](https://github.com/Shinigami92)
- [**Jérôme Benoit**](https://github.com/jerome-benoit)

## License

[MIT](./LICENSE)
