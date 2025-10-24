const { kv } = require('@vercel/kv');

// KV Database abstraction layer
class KVDatabase {
  // Users
  async createUser(username, hashedPassword) {
    const users = await this.getUsers();
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const userId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { id: userId, username, password: hashedPassword };
    users.push(newUser);
    
    await kv.set('users', JSON.stringify(users));
    return newUser;
  }

  async getUserByUsername(username) {
    const users = await this.getUsers();
    return users.find(u => u.username === username);
  }

  async getUsers() {
    const users = await kv.get('users');
    return users ? JSON.parse(users) : [];
  }

  // Todos
  async getTodosByUserId(userId) {
    const todos = await this.getAllTodos();
    return todos.filter(t => t.userId === userId);
  }

  async createTodo(userId, text, dueDate) {
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
    await kv.set('todos', JSON.stringify(todos));
    return newTodo;
  }

  async updateTodo(todoId, updates) {
    const todos = await this.getAllTodos();
    const todoIndex = todos.findIndex(t => t.id === todoId);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }
    
    todos[todoIndex] = { ...todos[todoIndex], ...updates };
    await kv.set('todos', JSON.stringify(todos));
    return todos[todoIndex];
  }

  async deleteTodo(todoId, userId) {
    const todos = await this.getAllTodos();
    const filteredTodos = todos.filter(t => !(t.id === todoId && t.userId === userId));
    await kv.set('todos', JSON.stringify(filteredTodos));
  }

  async getAllTodos() {
    const todos = await kv.get('todos');
    return todos ? JSON.parse(todos) : [];
  }

  // Appointments
  async getAppointmentsByUserId(userId) {
    const appointments = await this.getAllAppointments();
    return appointments.filter(a => a.userId === userId);
  }

  async getAppointmentsByDate(date) {
    const appointments = await this.getAllAppointments();
    return appointments.filter(a => a.date === date);
  }

  async createAppointment(userId, date, time) {
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
    await kv.set('appointments', JSON.stringify(appointments));
    return newAppointment;
  }

  async deleteAppointment(appointmentId, userId) {
    const appointments = await this.getAllAppointments();
    const filteredAppointments = appointments.filter(a => !(a.id === appointmentId && a.userId === userId));
    await kv.set('appointments', JSON.stringify(filteredAppointments));
  }

  async getAllAppointments() {
    const appointments = await kv.get('appointments');
    return appointments ? JSON.parse(appointments) : [];
  }

  // Contacts
  async createContact(name, email, message) {
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
    await kv.set('contacts', JSON.stringify(contacts));
    return newContact;
  }

  async getAllContacts() {
    const contacts = await kv.get('contacts');
    return contacts ? JSON.parse(contacts) : [];
  }

  async getContactById(contactId) {
    const contacts = await this.getAllContacts();
    return contacts.find(c => c.id === contactId);
  }
}

module.exports = new KVDatabase();