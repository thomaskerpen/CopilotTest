const { createClient } = require('redis');

// Redis Database abstraction layer
class RedisDatabase {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async connect() {
    if (this.client && this.initialized) return;
    
    try {
      this.client = createClient({
        url: process.env.REDIS_URL
      });
      
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });
      
      await this.client.connect();
      this.initialized = true;
      console.log('✅ Connected to Redis database');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  // Users
  async createUser(username, hashedPassword) {
    await this.connect();
    const users = await this.getUsers();
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const userId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { id: userId, username, password: hashedPassword };
    users.push(newUser);
    
    await this.client.set('users', JSON.stringify(users));
    return newUser;
  }

  async getUserByUsername(username) {
    await this.connect();
    const users = await this.getUsers();
    return users.find(u => u.username === username);
  }

  async getUsers() {
    await this.connect();
    const users = await this.client.get('users');
    return users ? JSON.parse(users) : [];
  }

  async getAllUsers() {
    return this.getUsers(); // Alias für Kompatibilität
  }

  // Todos
  async getTodosByUserId(userId) {
    await this.connect();
    const todos = await this.getAllTodos();
    return todos.filter(t => t.userId === userId);
  }

  async createTodo(userId, text, dueDate) {
    await this.connect();
    const todos = await this.getAllTodos();
    const todoId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    
    const newTodo = {
      id: todoId,
      userId,
      text,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    await this.client.set('todos', JSON.stringify(todos));
    return newTodo;
  }

  async updateTodo(todoId, updates) {
    await this.connect();
    const todos = await this.getAllTodos();
    const todoIndex = todos.findIndex(t => t.id === todoId);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }
    
    todos[todoIndex] = { ...todos[todoIndex], ...updates };
    await this.client.set('todos', JSON.stringify(todos));
    return todos[todoIndex];
  }

  async deleteTodo(todoId, userId) {
    await this.connect();
    const todos = await this.getAllTodos();
    const filteredTodos = todos.filter(t => !(t.id === todoId && t.userId === userId));
    await this.client.set('todos', JSON.stringify(filteredTodos));
  }

  async getAllTodos() {
    await this.connect();
    const todos = await this.client.get('todos');
    return todos ? JSON.parse(todos) : [];
  }

  // Appointments
  async getAppointmentsByUserId(userId) {
    await this.connect();
    const appointments = await this.getAllAppointments();
    return appointments.filter(a => a.userId === userId);
  }

  async getAppointmentsByDate(date) {
    await this.connect();
    const appointments = await this.getAllAppointments();
    return appointments.filter(a => a.date === date);
  }

  async createAppointment(userId, date, time) {
    await this.connect();
    const appointments = await this.getAllAppointments();
    
    // Check if slot is already booked
    const existing = appointments.find(a => a.date === date && a.time === time);
    if (existing) {
      throw new Error('Time slot already booked');
    }
    
    const appointmentId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    
    const newAppointment = {
      id: appointmentId,
      userId,
      date,
      time,
      createdAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    await this.client.set('appointments', JSON.stringify(appointments));
    return newAppointment;
  }

  async deleteAppointment(appointmentId, userId) {
    await this.connect();
    const appointments = await this.getAllAppointments();
    const filteredAppointments = appointments.filter(a => !(a.id === appointmentId && a.userId === userId));
    await this.client.set('appointments', JSON.stringify(filteredAppointments));
  }

  async getAllAppointments() {
    await this.connect();
    const appointments = await this.client.get('appointments');
    return appointments ? JSON.parse(appointments) : [];
  }

  // Contacts
  async createContact(name, email, message) {
    await this.connect();
    const contacts = await this.getAllContacts();
    const contactId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
    
    const newContact = {
      id: contactId,
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };
    
    contacts.push(newContact);
    await this.client.set('contacts', JSON.stringify(contacts));
    return newContact;
  }

  async getAllContacts() {
    await this.connect();
    const contacts = await this.client.get('contacts');
    return contacts ? JSON.parse(contacts) : [];
  }

  async getContactById(contactId) {
    await this.connect();
    const contacts = await this.getAllContacts();
    return contacts.find(c => c.id === contactId);
  }
}

module.exports = new RedisDatabase();