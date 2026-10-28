# Criteria

[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

`Criteria` is a TypeScript library that implements the Criteria pattern to specify and transport search and filtering criteria. A key use case is managing repository communication. When implementing repositories, we often expose specific methods such as `find`, `save`, `findOne`, `update`, etc. These methods represent the action to perform, but we frequently need to specify query criteria to fulfill that action.

## Installation

```bash
npm install @criteria-ts/core
```

## Quick Start

```typescript
import { Criteria } from '@criteria-ts/core';

const criteria = Criteria.create({
  filter: {
    or: [
      {
        username: { equals: 'daana' },
      },
      {
        username: { equals: 'blasteer' },
      },
    ],
  },
});

const user: User | null = await userRepository.findOne(criteria);
```

## Usage

### Filters

#### Operations

Operations are actions performed on a field or value, such as comparing values for equality, evaluating logical conditions, or checking whether an item belongs to a list.

#### Comparison Operators

**Basic syntax:**

```json
{
  "<field>": { "<operator>": "<field or value or expression>" }
}
```

> **Note:** To reference another field as a value, prefix the string with `$`, e.g., `"$username"`

| Operator |                       Description                       |
| :------: | :-----------------------------------------------------: |
|  equals  |           Checks that a value equals another            |
|   diff   |       Checks that a value is not equal to another       |
|   gte    | Checks that a value is greater than or equal to another |
|    gt    |       Checks that a value is greater than another       |
|   lte    |  Checks that a value is less than or equal to another   |
|    lt    |        Checks that a value is less than another         |

**Examples:**

```typescript
{
  email: {
    equals: 'wtf@example.com';
  }
}
```

```typescript
{
  age: {
    gte: 18;
  }
}
```

#### Logical Operators

**Basic syntax:**

```json
{
  "<operator>": ["<expression>", "<expression>", "..."]
}
```

| Operator |                  Description                  |
| :------: | :-------------------------------------------: |
|   and    |    Evaluates that all conditions are true     |
|    or    | Evaluates that at least one condition is true |

**Examples:**

```typescript
{
  and: [{ age: { gte: 18 } }, { age: { lte: 60 } }];
}
```

```typescript
{
  or: [
    { username: { equals: 'torlvals' } },
    { username: { equals: 'robCMartin' } },
  ];
}
```

#### Other Operators

| Operator |                      Description                       |
| :------: | :----------------------------------------------------: |
|   not    |                 Negates an expression                  |
|    in    | Checks if a value is contained within a list of values |

**Examples:**

```typescript
{
  not: {
    pilotName: {
      in: ["leclerc", "hammilton", "alonso", "perez"]
    }
  }
}
```

### Pagination

You can configure result pagination using either page-number or cursor-based strategies. Instantiate a `Pagination` object using the static factory methods `Pagination.byPage` or `Pagination.byCursor` depending on your strategy:

#### Using Page Number

```typescript
import { Criteria, Pagination } from '@criteria-ts/core';

const criteria = Criteria.create({
  filter: {
    age: {
      gte: 18,
    },
  },
  pagination: Pagination.byPage(3),
  orderBy: [
    ['id', 'DESC'],
    ['age', 'ASC'],
  ],
  limit: 15,
});

const users = await userRepository.findAll(criteria);
```

> **Note:** If pagination is specified without a `limit`, `Criteria` throws an exception. Pagination strictly requires a page size (`limit`) to operate: page-based pagination uses it to calculate the offset (`OFFSET = (page - 1) * limit`), and cursor-based pagination uses it to bound the batch size.

#### Using Cursor

When using cursor-based pagination, `Pagination` relies on the `CursorPayload` type, which represents a list of field criteria with values and sort orders.

```typescript
import { type CursorPayload } from '@criteria-ts/core';

const cursorPayload: CursorPayload = [
  ['createdAt', '1989-02-25 11:56:26.472 -0500', 'DESC'],
  ['username', 'richstallman', 'ASC'],
  ['id', 32, 'DESC'],
];
```

When specifying a cursor, `Criteria` assumes the cursor is serialized and uses a default [serializer](#serializers) to decode it into its canonical `CursorPayload` representation.

```typescript
import { Criteria, Pagination } from '@criteria-ts/core';

const cursor: string = '...'; // Serialized cursor

const criteria = Criteria.create({
  filter: {
    age: {
      gte: 18,
    },
  },
  pagination: Pagination.byCursor(cursor),
  limit: 30,
});

const users = await userRepository.findAll(criteria);
```

> **Note:** `Pagination` internally uses `CursorBase64Serializer` by default, but you can pass a custom implementation as the second argument to `Pagination.byCursor`.

#### Serializers

When exposing a cursor to a client, a serializer is needed to transport the cursor in an accepted format, such as a base64 encoded string.

```typescript
import { CursorBase64Serializer, type CursorPayload } from '@criteria-ts/core';

const cursorPayload: CursorPayload = [
  ['createdAt', '2026-09-24 11:56:26.472 -0500', 'DESC'],
  ['username', 'deivisss', 'ASC'],
  ['id', 10, 'DESC'],
];

const cursorBase64Serializer = new CursorBase64Serializer();

const encodeCursor: string = cursorBase64Serializer.encode(cursorPayload);

const decodeCursor: CursorPayload = cursorBase64Serializer.decode(encodeCursor);
```

> **Note:** You can implement the `CursorSerializer<K, T>` interface to create custom serializers.

## Development

This library is currently under active development. If you encounter any bugs or areas for improvement, feel free to report them.

## Contributing

Contributions are welcome. If you have ideas for improvements, find a bug, or want to add new functionality, feel free to open an issue or submit a Pull Request.
