

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" alt="NestJS Logo" width="60" style="background:white; padding:5px; border-radius:50%;" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSITHn_TgjDyhdWvePNw0mveDrTUr00GLfv_Q&s" alt="MongoDB Logo" width="60" style="background:white; padding:5px; border-radius:50%; object-fit: contain;" />
</p>

<h1 align="center">ViaCEP Integration API</h1>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_93.svg#9" alt="Coverage" /></a>

</p>

## Description

This project provides integration with the ViaCEP API using NestJS and MongoDB, enabling address lookup, storage, and management based on Brazilian postal codes (CEPs).

---

## Tech Stack

- **NestJS** – TypeScript-based progressive Node.js framework  
- **MongoDB** – NoSQL database for document-based storage  
- **Mongoose** – ODM for MongoDB integration  
- **Swagger** – Auto-generated API docs  
- **Docker Compose** – Simplified container orchestration for multi-container applications  
- **TypeScript** – JavaScript with strong typing for better developer experience

---

## Start database

```bash
$ docker compose up -d
```

## Install depencencies

```bash
$ pnpm install
```

## Run

```bash

$ pnpm run start
# or
$ pnpm run start:dev

```

## Run tests

```bash

# tests
$ pnpm test

# coverage
$ pnpm test:cov

```

## Swagger

```bash
# url
$ http://localhost:3000/docs

```
![alt text](./docs/image.png)

## ⚠️ Important Notice

> Before using the API to fetch address data, you must first synchronize the local database by making a `POST` request to the `/sync` endpoint.  
>  
> This step populates the database with ZIP code (CEP) data retrieved from the ViaCEP API.  
>  
> **Endpoint:**  
> `POST /sync`


## Code Coverage

![alt text](./docs/image-3.png)
![alt text](./docs/image-1.png)