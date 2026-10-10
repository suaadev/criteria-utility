# Criteria Utility

<p align="left">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Mongodb-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

`Criteria-utility` es una librería que implementa el patrón de diseño `Criteria`, el cual nos provee la capacidad de especificar y transportar criterios de búsqueda. Uno de los usos de esta librería es gestionar la comunicación con los repositorios. Actualmente, cuando implementamos repositorios lo hacemos exponiendo métodos con un propósito específico como `find`, `save`, `findOne`, `update`, etc. Estos métodos reflejan una acción que queremos realizar, pero muchas veces también necesitamos especificar un criterio para cumplir dicha acción:

```typescript
interface UserRepository {
  save(user: User): Promise<void>;
  delete(user: User): Promise<void>;
  findOne(criteria: Criteria): Promise<User | null>;
  findAll(criteria?: Criteria): Promise<User[]>;
}

class UserPostgresRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // some code here...
  }

  async delete(user: User): Promise<void> {
    // some code here...
  }

  async findOne(criteria: Criteria): Promise<User | null> {
    // some code here...
    return null;
  }

  async findAll(criteria?: Criteria): Promise<User[]> {
    // some code here...
    return [];
  }
}
```

Como se observa en el ejemplo, los métodos `findAll` y `findOne` reciben un objeto de tipo `Criteria`, el cual contendrá las reglas y criterios con los que queramos obtener usuarios. Esto, por otro lado, también nos ayuda a evitar extender el repositorio con métodos específicos como `findByIdAndUsername` dejando un repositorio mucho más limpio y fácil de mantener.

## Uso

Para empezar a usar la librería, debes importar la clase `Criteria` como en el siguiente ejemplo:

```typescript
import { Criteria } from 'criteria-utility';

const criteria = Criteria.build({
  or: [
    {
      username: { equals: 'daana' },
    },
    {
      username: { equals: 'blasteer' },
    },
  ],
});

const user: User | null = await userRepository.findOne(criteria);
```

> Obtiene un usuario donde el username puede ser **"daana"** o **"blasteer"**.

La clase `Criteria` consta de un método estático `build` para instanciar de manera rápida y sencilla un objeto de tipo `Criteria`. Este método recibe la expresión, paginación, orden y límite.

### Expresiones

Armar criterios de búsqueda es muy intuitivo. Si ya has trabajado con `MongoDB`, te vas a sentir como en casa, ya que la sintaxis sigue una idea muy parecida para que no tengas que aprender todo desde cero. Aquí tienes las operaciones que puedes usar:

#### Operaciones

Las operaciones son acciones que puedes realizar con un campo o cierto valor, como comparar si un valor es igual a otro, si 2 condiciones se cumplen o verificar si un elemento se encuentra en una lista.

#### Operadores de comparación

**Sintaxis básica:**

```json
{
  "<field or value>": { "<operator>": "<field or value or expression>" }
}
```

| Operador |                   Descripción                   |
| :------: | :---------------------------------------------: |
|   diff   |    Compara que un valor sea diferente a otro    |
|   gte    | Compara que un valor sea mayor o igual que otro |
|    gt    |     Compara que un valor sea mayor que otro     |
|   lte    | Compara que un valor sea menor o igual que otro |
|    lt    |     Compara que un valor sea menor que otro     |
|  equals  |      Compara que un valor sea igual a otro      |

**Ejemplos:**

```typescript
{
  email: {
    equals: 'pepito@example.com';
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

#### Operadores lógicos

**Sintaxis básica:**

```json
{
  "<operator>": ["expressions..."]
}
```

| Operador |                    Descripción                     |
| :------: | :------------------------------------------------: |
|    or    | Evalúa que alguna de las condiciones sea verdadera |
|   and    |  Evalúa que todas las condiciones sean verdaderas  |

**Ejemplos:**

```typescript
{
  and: [{ age: { gte: 18 } }, { age: { lte: 60 } }];
}
```

```typescript
{
  or: [
    { username: { equals: 'gasly' } },
    { username: { equals: 'hammilton' } },
  ];
}
```

#### Otros

| Operador |                       Descripción                       |
| :------: | :-----------------------------------------------------: |
|    in    | Evalúa si un valor se encuentra en una lista de valores |
|   not    |                   Niega una expresión                   |

**Ejemplos:**

```typescript
{
  not: {
    pilotName: {
      in: ["leclerc", "hammilton", "alonso", "perez"]
    }
  }
}
```

### Paginación

También puedes decidir cómo quieres paginar tus resultados aplicando estrategias de navegación entre páginas usando número de página o cursor. Debes instanciar un objeto de tipo `Pagination` mediante el uso de sus métodos estáticos `byPage` o `byCursor` dependiendo de tu estrategia a usar, por ejemplo:

#### Usando número de página

```typescript
import { Criteria, Pagination } from 'criteria-utility';

const criteria = Criteria.build(
  {
    age: {
      gte: 18,
    },
  },
  Pagination.byPage(3),
  [
    ['id', 'DESC'],
    ['age', 'ASC'],
  ],
  15, // Límite de resultados por página
);

const users = await userRepository.findAll(criteria);
```

> **Nota:** Si se especifica una paginación sin un `limit`, la paginación será ignorada. La paginación requiere obligatoriamente un tamaño de página (`limit`) para operar: en la paginación por página es necesario para calcular el desplazamiento (`OFFSET = (page - 1) * limit`), y en la paginación por cursor delimita el tamaño del lote a recuperar.

#### Usando cursor

Al emplear un cursor como estrategia, este puede ser una implementación propia o usando `CursorSerializer`, el cual es proveído por la librería para la serialización de cursores de manera genérica.

```typescript
import { Criteria, Pagination } from 'criteria-utility';

const cursor: string = '...'; // Cadena serializada del cursor

const criteria = Criteria.build(
  {
    age: {
      gte: 18,
    },
  },
  Pagination.byCursor(cursor),
  [],
  30, // Límite de resultados por página
);

const users = await userRepository.findAll(criteria);
```

#### Cursor serializer

Esta clase nos ayuda a la serialización de cursores para ser transportados. Para serializar un cursor debes emplear la clase `CursorSerializer` y hacer uso de sus métodos `encode` y `decode` para la serialización y decodificación del mismo, por ejemplo:

```typescript
import { CursorSerializer } from 'criteria-utility';

const encodeCursor: string = CursorSerializer.encode([
  ['createdAt', '2026-09-24 11:56:26.472 -0500', 'DESC'],
  ['username', 'deivisss', 'ASC'],
  ['id', 10, 'DESC'],
]);

const decodeCursor: CursorPayload = CursorSerializer.decode(encodeCursor);
```

Como parámetro tenemos la lista de propiedades, valores y orden que se usarán para pivotar entre resultados. Se debe prestar atención al orden, puesto que esta será la prioridad de filtrado de los próximos resultados.

En casos donde los primeros criterios no sean únicos o puedan tener valores repetidos, se debe especificar un criterio único al final de la lista para que actúe como factor de desempate y así evitar comportamientos indeseados.

## Generadores

La utilidad `Criteria` actúa como un objeto que encapsula la lógica para filtrar resultados, sea de un repositorio o un almacén de datos custom, pero dicha lógica tiene que ser interpretada por la implementación que estés empleando. Aquí es donde entran los generadores: estos nos ayudan a traducir un `Criteria` a la implementación que estés usando.

Un ejemplo podría ser que tienes un repositorio que se comunica con una base de datos Postgres y lo haces mediante la librería nativa `pg`. Cuando recibimos el objeto `Criteria`, tenemos que generar el `sql` correspondiente a la lógica encapsulada en `Criteria`. Para esto, la librería ya cuenta con `PostgresSqlGenerator`, que nos genera el `sql` a partir de un objeto `Criteria`.

```typescript
type Book = {
  id: number;
  name: string;
  author: string;
  rate: number;
  publicationDate: Date;
};

const criteria = Criteria.build<Book>(
  {
    and: [{ rate: { gte: 4 } }, { publicationDate: { gte: '1911-01-01' } }],
  },
  Pagination.byPage(22),
  [
    ['publicationDate', 'DESC'],
    ['name', 'ASC'],
  ],
  15,
);

const sql = PostgresSqlGenerator.fromCriteria(criteria, 'bk');

console.log(sql);
```

El resultado sería:

```typescript
{
  fullSql: 'WHERE ((bk."rate" >= $1) AND (bk."publicationDate" >= $2)) ORDER BY bk."publicationDate" DESC, bk."name" ASC OFFSET 315 LIMIT 15',
  sql: {
    where: '((bk."rate" >= $1) AND (bk."publicationDate" >= $2))',
    orderBy: 'bk."publicationDate" DESC, bk."name" ASC',
    offset: 315,
    limit: 15
  },
  values: [ 4, '1911-01-01' ]
}
```

**Un detalle con los cursores:**

Cuando usas un cursor, este ya sabe exactamente cómo ordenar y paginar los siguientes resultados. Por eso, si defines un `orderBy` manual al mismo tiempo que pasas un cursor, el generador priorizará el cursor para evitar que la paginación se rompa o devuelva resultados inesperados.

## Desarrollo

Esta librería está actualmente en desarrollo activo. Puede que encuentres algún error o detalles por pulir en el camino, ya que es un proyecto de código abierto pensado para ayudar a otros desarrolladores a implementar el patrón de diseño `Criteria` de forma rápida y sencilla :).

## Contribución

Toda ayuda es más que bienvenida. Si tienes ideas para mejorar la librería, encuentras algún fallo o quieres sumar una nueva funcionalidad, siéntete libre de abrir un issue o enviar un Pull Request.