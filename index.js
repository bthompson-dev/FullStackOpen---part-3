require('dotenv').config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require('./models/person');

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

morgan.token("body", function (request, response) {
  if (request.body) {
    return JSON.stringify(request.body);
  }
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];




app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

Person.findById(id).then(person => {
  response.json(person);
})
});

app.get("/info", (request, response) => {
  let number = persons.length;
  let time = new Date();
  response.send(`<p>Phonebook has info for ${number} people</p>
    <p>${time}</p>`);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.post("/api/persons", (request, response) => {
  if (!request.body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!request.body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }


  let person = new Person({
    name: request.body.name,
    number: request.body.number,
  });

  person.save().then(savedPerson => {
      response.json(savedPerson);
  })


});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
