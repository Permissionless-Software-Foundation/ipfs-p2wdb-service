# Clean Architecture

The architecture of the code in this repository attempts to follow the ideas behind [Clean Architecture](https://youtu.be/CnailTcJV_U). Code is split up into four groups:

- Entities
- Use Cases
- Adapters
- Controllers

Without knowing the patterns and reasoning behind Clean Architecture, the code in this project will look 'weird' to most JavaScript developers. This is because Clean Architecture comes from outside the JavaScript world and some of it's core ideas (like dependency inversion) don't translate easily into JavaScript.

- [Summary Video](https://youtu.be/LftjSIbHzbo)

Clean Architecture solves two key problems is application design:

- It manages increasing complexity as new features and interfaces are added over time.
- It provides defense against [code rot](https://en.wikipedia.org/wiki/Software_rot) by isolating the parts that rarely change from the parts that change frequently.

## File Layout

The code in the `src` folder of this repository is split up into four main directories: `entities`, `use-cases`, `adapaters`, and `controllers`. These directories reflect the arrangement of concerns in the Clean Architecture diagram:

![Clean Architecture Diagram](./diagrams/cleanarchitecture.jpg)

The above diagram is reflected in the code. The diagram below shows how dependencies are arranged in this project:

![Dependency Graph](./diagrams/p2wdb-clean-architecture.png)

Major features of the diagram above:

- The blunt point of an arrow connects the file that depends on the file pointed to by the pointy end of the arrow.
- The dependencies in the above diagram follow the dependency arrows in the Clean Architecture diagram.
- This project is a Koa web server app. Koa is a framework and the entry point of Koa program loads the Controllers first.
- The Controllers load the Adapters, then it loads the Use Cases, then finally the Entities. Each lower stage depends on the stage above it.
- Dependency Injection is used heavily to pass dependencies to the individual libraries.
- Encapsulation pattern is used for unit tests.
