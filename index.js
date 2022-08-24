require('dotenv').config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require('./models/person');
const { count } = require('./models/person');

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


app.get("/api/persons", (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
  .catch(error => next(error))
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id

Person.findById(id).then(person => {
  response.json(person);
})
.catch(error => next(error))
});

app.get("/info", (request, response, next) => {
  
  let time = new Date();
  
  Person.count().then(number => {
    response.send(`<p>Phonebook has info for ${number} people</p>
    <p>${time}</p>`);
  })
  .catch(error => {
    next(error);
  })

});

app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body;

  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number}, 
    {new: true,
    runValidators: true,
    context: 'query'})
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      next(error);
    })
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.post("/api/persons", (request, response, next) => {
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
  .catch(error => {
    next(error);
  })


});

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.error(error.name)

  if (error.name === 'CastError') {
    return response.status(400).json({error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message});
  }

  next(error);
}

app.use(errorHandler)

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
