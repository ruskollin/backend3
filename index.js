require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
morgan.token('body', function (request) {
    return JSON.stringify(request.body)
})
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then((count) => {
    response.send(
        `<h1>Phonebook has info for ${count} people</h1>
         ${new Date()}`
         )
    })
  })


// app.get('/info', (request, response) => {
//     let count = persons.length
//     let date = new Date()
//     response.send(
//         `<h1> Phonebook has info for ${count} people </h1>
//         ${date}`
//     )
// })

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// app.delete('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     persons = persons.filter(person => person.id !== id)
//     response.status(204).end()
// })

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ error: 'Missing Name' })
    } else if (!body.number) {
        return response.status(400).json({ error: 'Missing Number' })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
        .catch((error) => next(error))
    })
})

// app.post('/api/persons', (request, response) => {
//     const { name, number } = request.body
//     const generateId = () => {
//         const newId = Math.floor(Math.random() * 3000) + 1
//         return newId
//     }
//     const duplicate = persons.find(p => p.name === name)

//     if (duplicate) {
//         return response.status(400).json({
//             error: 'name must be unique'
//         })
//     } else if (!name || !number) {
//         return response.status(400).json({
//             error: 'name or number is missing'
//         })
//     }

//     const person = {
//         name: name,
//         number: number,
//         id: generateId(),
//     }

//     persons = persons.concat(person)
//     response.json(person)
// })

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
  }
  
  app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})