const express = require('express')
const app = express()
const morgan = require('morgan')
morgan.token('body', function (request, response) { 
    return JSON.stringify(request.body)
})
const cors = require('cors')

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "040-123454"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "040-123426"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "040-123450"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    let count = persons.length
    let date = new Date()
    response.send(
        `<h1> Phonebook has info for ${count} people </h1>
        ${date}`
    )
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const { name, number } = request.body
    const generateId = () => {
        const newId = Math.floor(Math.random() * 3000) + 1
        return newId
    }
    const duplicate = persons.find(p => p.name === name)

    if (duplicate) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    } else if (!name || !number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    const person = {
        name: name,
        number: number,
        id: generateId(),
    }

    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})