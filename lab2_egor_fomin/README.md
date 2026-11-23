# Лабораторная работа № 2 — Books API

Учебный REST API для работы с книгами и авторами на Node.js и Express. Проект организован по MVC: модели содержат данные и операции с ними, контроллеры обрабатывают запросы, а маршрутизаторы связывают URL с контроллерами.

Репозиторий: [Tcyiu/USM-NodeJS — папка lab2_egor_fomin](https://github.com/Tcyiu/USM-NodeJS/tree/master/lab2_egor_fomin)

## Запуск

Требуется установленный Node.js и npm.

```bash
cd lab2_egor_fomin
npm install
npm start
```

Сервер по умолчанию доступен по адресу `http://localhost:3000`. Другой порт можно задать переменной окружения `PORT`. Для запуска с автоматическим перезапуском при изменении файлов используйте `npm run dev` (Node.js 18.11 или новее).

## Структура проекта

```text
lab2_egor_fomin/
├── app.js
├── package.json
├── routes/
│   ├── bookRoutes.js
│   └── authorRoutes.js
├── controllers/
│   ├── bookController.js
│   └── authorController.js
├── models/
│   ├── bookModel.js
│   └── authorModel.js
└── middleware/
    └── logger.js
```

- `app.js` настраивает Express, JSON middleware, логирование, маршруты и ответ для неизвестных URL.
- `models/` содержит начальные данные и операции над ними. Изменения хранятся только в памяти и сбрасываются после перезапуска сервера.
- `routes/` объявляет URL и HTTP-методы и передаёт запросы контроллерам.
- `controllers/` проверяет параметры/тело запроса, вызывает модели и формирует HTTP-ответы.
- `middleware/logger.js` логирует каждый запрос в формате `METHOD | URL | DD.MM.YYYY HH:mm`.

## Маршруты

| Метод | URL | Назначение |
|---|---|---|
| GET | `/api/books` | Все книги; поддерживает фильтры `genre` и `year` |
| GET | `/api/books/:id` | Книга по ID |
| POST | `/api/books` | Добавить книгу |
| PATCH | `/api/books/:id` | Частично изменить книгу |
| DELETE | `/api/books/:id` | Удалить книгу |
| GET | `/api/books/search?title=node` | Поиск по части названия без учёта регистра |
| GET | `/api/authors` | Все авторы |
| GET | `/api/authors/:id` | Автор по ID |
| GET | `/api/authors/:id/books` | Книги указанного автора |
| GET | `/api/statistics` | Количество книг, авторов и жанров, новая и старая книги |

Для `POST /api/books` обязательны непустые `title` и `genre`, целочисленные `authorId` и `year`. Автор с указанным `authorId` должен существовать. Для `PATCH` передайте одно или несколько из тех же полей. `DELETE` возвращает удалённую книгу. Неизвестный URL и несуществующие книги/авторы возвращают JSON с ошибкой и статусом `404`; некорректное тело или значения — статус `400`.

## Проверка через curl

Выполняйте команды в другом терминале, пока сервер запущен. Для Windows можно использовать `curl.exe`.

```bash
curl http://localhost:3000/api/books
curl http://localhost:3000/api/books/2
curl "http://localhost:3000/api/books?genre=fantasy&year=1937"
curl "http://localhost:3000/api/books/search?title=node"
curl http://localhost:3000/api/authors
curl http://localhost:3000/api/authors/1/books
curl http://localhost:3000/api/statistics
```

Добавление, изменение и удаление (запрос удаления удаляет книгу из текущего процесса):

```bash
curl -i -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d "{\"title\":\"Clean Architecture\",\"authorId\":3,\"genre\":\"programming\",\"year\":2017}"
curl -i -X PATCH http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d "{\"year\":1938}"
curl -i -X DELETE http://localhost:3000/api/books/6
```

`-i` показывает HTTP-статус и заголовки. Успешный GET/PATCH обычно возвращает `200`, успешный POST — `201`, неверный запрос — `400`, неизвестный ресурс или маршрут — `404`. Чтобы проверить `400`, отправьте POST без одного из обязательных полей; чтобы проверить `404`, запросите, например, `/api/books/999` или `/unknown`.
