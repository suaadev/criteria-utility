# Criteria Utility

<p align="left">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

Seguramente cuando haz trabajado en arquitecturas limpias, te haz topado con cierto problema al momento de comunicarse con un repositorio sin exponer detalles de implementación. Como sabemos, en arquitectura limpia buscamos que los componentes estén lo más desacoplados posible. Por ejemplo, en arquitectura hexagonal (puertos y adaptadores) definimos un puerto (la interfaz en el dominio) y su adaptador (la implementación en la infraestructura):

```typescript
// src/user/domain/user-repository.ts

interface UserRepository {
  save(user: User): Promise<void>;
  delete(user: User): Promise<void>;
  findById(id: number): Promise<User | null>;
}

// src/user/infrastructure/repositories/user-postgres-repository.ts

class UserPostgresRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // some code here...
  }

  async delete(user: User): Promise<void> {
    // some code here...
  }

  async findById(id: number): Promise<User | null> {
    // some code here...
    return null;
  }
}
```

Los clientes que consuman este repositorio tendrán disponible el método `findById(id: number)`. Pero, ¿qué pasa si queremos buscar usuarios por edad y apellido, por nombre de usuario, o simplemente traer los últimos registrados?

Lo común al inicio es querer modificar `findById`, pero eso rompería el principio Open/Closed (OCP) de SOLID: estaríamos modificando código que ya funciona en vez de extenderlo. Si decidimos extender la interfaz creando un método para cada caso, terminamos con algo así:

```typescript
// src/user/domain/user-repository.ts

interface UserRepository {
  save(user: User): Promise<void>;
  delete(user: User): Promise<void>;
  findById(id: number): Promise<User | null>;
  findByFirstNameAndAge(firstName: string, age: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

// src/user/infrastructure/repositories/user-postgres-repository.ts

class UserPostgresRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // some code here...
  }

  async delete(user: User): Promise<void> {
    // some code here...
  }

  async findById(id: number): Promise<User | null> {
    // some code here...
    return null;
  }

  async findByFirstNameAndAge(
    firstName: string,
    age: number,
  ): Promise<User | null> {
    // some code here...
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    // some code here...
    return null;
  }

  async findAll(): Promise<User[]> {
    // some code here...
    return [];
  }
}
```

Añadimos tres métodos nuevos solo para cubrir esos filtros. Y si mañana necesitamos combinaciones más complejas, nuestro repositorio terminará con una explosión de métodos haciendo prácticamente lo mismo con pequeñas variaciones.

La idea central de esta librería es resolver eso: en lugar de crear un método por cada consulta, enviamos un **criterio de búsqueda**. Un objeto simple, fácil de leer y transportar desde un controlador o caso de uso hasta la base de datos, dejando el repositorio limpio:

```typescript
// src/user/domain/user-repository.ts

interface UserRepository {
  save(user: User): Promise<void>;
  delete(user: User): Promise<void>;
  findOne(criteria: Criteria): Promise<User | null>;
  findAll(criteria?: Criteria): Promise<User[]>;
}
```

---

> **Nota:** La librería incluye `PostgresSqlGenerator` listo para usar con PostgreSQL, pero dado que el AST y el modelo Criteria son independientes, se pueden crear generadores para cualquier otro motor (MySQL, SQLite, etc.).
