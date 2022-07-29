# Borderless

Framework for transparently running code anywhere across the system architecture.

- [Project Goal](#project-goal)
- [Enviroments and their properties](#enviroments-and-their-properties)
  - [Interplanetary Computation](#interplanetary-computation)
- [How Will It Work?](#how-will-it-work)
  - [Code registration requirements](#code-registration-requirements)
- [Misc Notes](#misc-notes)
  - [Notes on Formats](#notes-on-formats)
  - [Notes on moment of execution](#notes-on-moment-of-execution)
  - [Notes on mobile apps](#notes-on-mobile-apps)
  - [Notes on IoT devices](#notes-on-iot-devices)
  - [Notes on topology](#notes-on-topology)
    - [Machine Learning](#machine-learning)
- [Participants](#participants)

## Project Goal

The goal of this framework is to make architechtural / topology decisions about where the code runs at compile time (based on configuration) and at run time (based on client capabilities or operational needs) as opposed to hardcoding it during development.

We hope that this will make systems less rigid post-coding and simplify re-architecture and optimization.

## Enviroments and their properties

Systems built using Borderless framework could support a wide variety of environments. We have our primary attention on web applications, however mobile application development (native and hybrid), IoT devices and other distributed systems might be included.

As extreme, mostly illustrative, goal, we'd also like to explore [Interplanetary Computation](#interplanetary-computation) where latencies and resource constraints are extreme and make it easier to realise the need for this approach.

<table>
<tr>
    <th>Environment</th>
    <th>Location</th>
    <th>Payload Supported</th>
    <th>Flavor/Constraints</th>
    <th>APIs supported</th>
    <th>Communication protocols</th>
    <th>Latency to User (ms, estimated)</th>
    <th>CPU Availability (L/M/H)</th>
    <th>Power Availability (L/M/H)</th>
    <th>Storage Availability (L/M/H)</th>
</tr>
<tr>
    <td><a href="https://www.youtube.com/watch?v=K2QHdgAKP-s">Rendering Pipeline</a></td>
    <td>Browser</td>
    <td>HTML + CSS</td>
    <td></td>
    <td></td>
    <td></td>
    <td>16 - 300</td>
    <th>Low, Medium, High</th>
    <th>Low, Medium, High</th>
    <th>Low</th>
</tr>
<tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Glossary/Main_thread">Main Thread</a></td>
    <td>Browser</td>
    <td>JavaSript, WebAssembly</td>
    <td>Bundled, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">JS Modules</a></td>
    <td>Web APIs</td>
    <td>HTTP, postMessage</td>
    <td>16 - 1000</td>
    <th>Low, Medium, High</th>
    <th>Low, Medium, High</th>
    <th>Low, Medium</th>
</tr>
<tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers">Web Workers</a></td>
    <td>Browser</td>
    <td>JavaSript, WebAssembly</td>
    <td>Bundled</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers">Subset of Web APIs (notably no DOM access)</a></td>
    <td>HTTP, postMessage</td>
    <td>50 - 500</td>
    <th>Low, Medium, High</th>
    <th>Low, Medium, High</th>
    <th>Low, Medium</th>
</tr>
<tr>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers">Service Workers</a></td>
    <td>Browser</td>
    <td>JavaSript, WebAssembly</td>
    <td>Bundled</td>
    <td></td>
    <td>HTTP (fetch), postMessage</td>
    <td>50 - 350</td>
    <th>Low, Medium, High</th>
    <th>Low, Medium, High</th>
    <th>Low, Medium</th>
</tr>
<tr>
    <td><a href="https://en.wikipedia.org/wiki/Edge_computing">Edge Workers</a></td>
    <td><a href="https://en.wikipedia.org/wiki/Content_delivery_network">CDN</a> (<a href="https://aws.amazon.com/lambda/edge/">AWS Lambda@Edge</a>, <a hreaf="https://workers.cloudflare.com/">CloudFlare</a>, <a href="https://developer.akamai.com/akamai-edgeworkers-overview">Akamai</a>, <a href="https://www.fastly.com/products/edge-compute">Fastly</a>)</td>
    <td>JavaSript (Fastly also supports WebAssembly)</td>
    <td>Bundled, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">JS Modules</a></td>
    <td></td>
    <td>HTTP</td>
    <td>100 - 500</td>
    <th>Low, Medium, High</th>
    <th>Low, Medium, High</th>
    <th>High</th>
</tr>
<tr>
    <td><a href="https://en.wikipedia.org/wiki/Serverless_computing">Serverless</a></td>
    <td>Cloud</td>
    <td>JavaScript (and many other)</td>
    <td>Bundled, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">JS Modules</a></td>
    <td><a href="https://nodejs.org/api/">Subset of Node APIs</a>, notably NO file access</td>
    <td>HTTP, some networking</td>
    <td>200 - 1500</td>
    <th>Low, Medium</th>
    <th>High</th>
    <th>High</th>
</tr>
<tr>
    <td><a href="https://nodejs.org/en/">NodeJS HTTP Server</a></td>
    <td>Server (on request)</td>
    <td>JavaScript, WebAssembly</td>
    <td>Bundled, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">JS Modules</a></td>
    <td><a href="https://nodejs.org/api/">Node APIs</a>, notably file access</td>
    <td>HTTP, any networking</td>
    <td>300 - 1500</td>
    <th>Medium, High</th>
    <th>High</th>
    <th>High</th>
</tr>
<tr>
    <td>Build pipelines</td>
    <td>Server (on code / data change)</td>
    <td>JavaScript (and many other)</td>
    <td>Bundled, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">JS Modules</a></td>
    <td><a href="https://nodejs.org/api/">Node APIs</a>, notably file access</td>
    <td>HTTP, any networking</td>
    <td>n/a</td>
    <th>Medium, High</th>
    <th>High</th>
    <th>High</th>
</tr>
</table>

### Interplanetary Computation

There are already massive <a href="https://en.wikipedia.org/wiki/Interplanetary_Internet">Interplanetary Internet</a> initiatives underway as space exploration missions start to unify communication between various elements of their space hardware.

We want to expand it from communication and storage to computation as well - primarily because the analogy with current web application topologies is clear and exhaggerated constraints would make it easier to imagine a need for Borderless computing.

Imagine that a Mars rover needs to execute some code, we have a few options here:

- Execute it on the rover computer itself, where CPU, energy, storage capacity and temperatures of the environment are extremely constrained
- Communicate with a local, on-Mars stationary computer (just imagine that we already have them) where energy needs are probably solved a bit better, environment is better controlled and with no need to move, larger equipment with more storage and CPU are deployed
- Alternatively, it can communicate (as it currently does) with orbiting stations that have relatively good bandwidth as Mars atmosphere is thinner then Earths and communications are easier to intercept. Those stations also have larger solar panels and communication dishes because there is less debree and gravity making it easier to deploy
- Those ground or orbital stations can also communicate with Earth's orbital or ground stations and request computation to be done further upstream
- With lunar mission, we can imagine more intermediate hops becoming available as well

All these options or a combination of them can be chosen under certain conditions.

Some of this is currently in full operation as various space agencies of different countries are exploring the space, some of the solutions are already available and [according to Vint Cerf's presentation at Chrome Univercity in the fall of 2020](https://youtu.be/_HuSec9UrGE?t=1722), internet protocols already had to be updated to support extreme latencies.

Extreme latencies require us to have very realistic and well defined data lifecycle / freshness policies and build our software and infrastracture around those needs.

Space missions in general require very sophisticated telemetry instrumentation because maintenance of the systems is extremely expensive and risk reduction is a very good cost reduction strategy.

All this helps us macro-model the needs that we similarly have in our earthly, micro-world where latencies similarly vary more than average software engineer can easily envision, data lifecycle / freshness policies can't just be shoved into "our data is always dynamic" bucket and we need to be building better developer experience to solve these issues.

So we encourage you to keep the interplanetary use-case in your mind when you discuss, architect and build Borderless framework and ultimately applications that it would power.

## How Will It Work?

Developers use a language that can be executed / transpiled or compiled into the target running on all supported platforms. At the beginning we will use JavaScript, but WebAssembly can be another alternative for web, other languages compiled into target executables potentially too for non-web applications.

All the functions that can be called are annotated or "registered" providing all the metadata needed to make a decision which environments can support running it and which have to delegate to the upstream execution environment(or potentially a mesh in the future).

Initially, registration will have to happen in the code, but we can imagine a compiler that could read annotations and even do code analysis to deduce some of the properties of the code.

When code is to be deployed, in addition to source code, each project would include a configuraton file ([`topology.js`](app_mockup/topology.js)) that defines execution environments available to run it and `build` infrastructure will be used to compile deployable packages for each of the target environments.

Each package will include the code that can run in that environment, transpiled with support for language properties of the environment (e.g. target format, ES modules support vs. bundled, polifills for APIs that can be polyfilled and etc.).

It will also include the environment configuration file `environment.js` ([1](app_mockup/dist/main-site/pub/js/environment.js),[2](app_mockup/dist/main-site/server/environment.js)) that dictates which function calls have to be fulfilled locally and which have to be routed through a communication protocol to a set of upstream locations (we'll support HTTP for network and postMessage for worker communication in the browser to start).

As code get wrapped into topology decision logic, it can also include speed instrumentation that would report telemetry data to the operations datacenter and help with visual understanding of code execution and will allow operators to modify and deploy topology changes as needed.

Same telemetry data could be used to [dynamically change the topology](#machine-learning).

### Code registration requirements

- Required APIs (e.g. Web APIs, databases, file/storage access)
- Required latency range
- Data lifecycle / freshness policies
- Async execution as any part of the code might need to require to wait

## Misc Notes

Below are some notes that should or should not be taken into account when designing a Borderless system.

### Notes on Formats

Different parts of the topology can operate and produce different formats.

It is unclear how this plays into the overall framework and if it should abstract it away or concentrate on specific flows and transformations.

Here are a few use-cases that are currently are pretty clear and are widely used in the industry:

- "Static-generation" workflow when Build pipeline generates HTML that is deployed to other environments and ultimately to rendering pipeline in the browser _before user makes a request_ reducing latency to possible minimum. This use-case is popularized by JAMstack and got birth to services like Netlify that specializes in that
- All environments can get code as input and produce HTML at runtime for browser rendering pipeline to consume - this is the classic web development
- All environments can produce data (serialized in JSON, for example) which downstream environments can render (this includes non-HTML rendering environments like mobile apps or IoT devices and etc)
- Build pipelines convert code in one language into destination languages and packages (traditional CI/CD) to be executed in other environments
- Some environments can execute code in various languages
- Some environments can execute WebAssembly which in turn can be a compilation target for some languages

### Notes on moment of execution

This framework should unify various execution patterns in order to be able to convert code from one mode of operation into another based on performance requirements and data freshness requirements.

- Some operations can execute code upon request so users get the latest and greatest data (traditional, 3-tier web development)
- Some operations require real-time visualization and very low latency (e.g. gameplay)
- Some operations can be done when data changes, but can be less than freshest (event-based build pipeline)
- Some environments can have intermittent connectivity (e.g. progressive web apps, mobile apps) and should have flexible data policies and fallbacks for all, some, or no data (based on business functionality), but can produce a useful feedback for the user in as many cases as possible
- Some operations can be performed in a batch manner because data freshness policy accepts large latency, but data volumes, CPU and power consumption are a large and require cost optimization (machine learning applications, vendor data sync, etc.)

### Notes on mobile apps

Mobile applications and web applications share majority of the logic and data requirements, but have a significantly different rendering technologies and release cycles.

### Notes on IoT devices

IoT devices usually have low rendering requirements, and some data consumtion requirements, but often concentrate on producing data and sending it back into central storage.

This "data source" behavior can also be included here because this potentially applies to other applications like telemetry or business analytics flows.

### Notes on topology

We envision multiple types of topology decisions:

- Configuration - similar to traditional operations / DevOps workflow that defines the systems code deploys to
- Run-time scalability adjustments - similar to modern DevOps workflows that scales some types of environments up/down in order to support consumption needs or to selectively shut down parts of the system in case of an outage
- Run-time decisions based on environment capabilities:
- Progressively Enhanced Single-page Applications that use so-called Server-Side rendering (SSR) can use one topology to produce HTML for initial view, but another topology for subsequent views that use front-end routing
- Progressive Web Applications (PWAs) use one topology for first request (when user has never been to the site), but another for subsequent requests when Service Worker (installed after first request) can take over some operations.
- Run-time decisions based on users device capabilities, e.g. network speed, CPU power, battery levels, etc. Off-loading large computations to the server in case of low-powered devices or running them with much lower latency in web workers, for example (there multiple use-cases with data analysis and visualization, machine learning, media format processing and etc.)
- Run-time decisions based on users location or content preferences, e.g. geo-fencing or language

Ultimately we'd want to be able to reproduce most of existing topologies that are well established in the industry.
Here are several [diagrams that illustrate existing topologies](docs/diagrams/topologies.md).

#### Machine Learning

Topology can also be dynamically optimized based on telemetry that comes from all the environments about execution speeds, failure rates and business outcomes.

Machine learning can be used, in analogy with how optimizing JIT compilers optimize code in browsers, topology optimizer can perform optimization of topology to minimize latency and/or to maximize business KPIs.

## Participants

I say "we" when referring to the team that would work on this project, but so far this was only born in my brain.

I talked about it to a few people and hope to attract more eyes and brains to this project and hopefully, it will lead to the project's progress and success.

Feel free to reach out to me in the issue tracker if you have questions, comments, or suggestions.

When more people will start contributing to this project, I'll update this section and include you all below:

- [Sergey Chernyshev](https://www.sergeychernyshev.com/)
- ... your name could be here ...
