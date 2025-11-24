type StudentStatus = 'ACTIVE' | 'INACTIVE';

type StudentMock = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  matricula: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
};

type RoomMock = {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  hasEquipment: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const buildId = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;

export const defaultStudents: StudentMock[] = [
  {
    id: 'student-1',
    userId: 'user-1',
    firstName: 'Ana',
    lastName: 'Souza',
    cpf: '123.456.789-01',
    email: 'ana.souza@pucpr.br',
    matricula: '20231234',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-01T10:00:00Z').toISOString(),
  },
  {
    id: 'student-2',
    userId: 'user-2',
    firstName: 'Bruno',
    lastName: 'Lima',
    cpf: '987.654.321-00',
    email: 'bruno.lima@pucpr.br',
    matricula: '20235678',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-02T11:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-02T11:00:00Z').toISOString(),
  },
];

export const defaultRooms: RoomMock[] = [
  {
    id: 'room-1',
    roomNumber: 'A101',
    type: 'CLASSROOM',
    capacity: 40,
    hasEquipment: true,
    status: 'AVAILABLE',
    createdAt: new Date('2024-01-03T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-03T09:00:00Z').toISOString(),
  },
  {
    id: 'room-2',
    roomNumber: 'LAB-02',
    type: 'LABORATORY',
    capacity: 25,
    hasEquipment: true,
    status: 'AVAILABLE',
    createdAt: new Date('2024-01-05T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-05T09:00:00Z').toISOString(),
  },
];

let studentsState: StudentMock[] = [...defaultStudents];
let roomsState: RoomMock[] = [...defaultRooms];

/**
 * Mock da API de Students
 */
export function mockStudentsApi(initial = defaultStudents) {
  studentsState = initial.map((student) => ({ ...student }));

  // Mock GET /students - Interceptar apenas URLs de API (com porta ou /api/)
  // Padrão: http://localhost:3001/api/v1/students ou http://localhost:3001/students
  cy.intercept('GET', /http:\/\/localhost:(3001|3002|3000)\/.*\/students[^/]*$/, {
    statusCode: 200,
    body: studentsState,
  }).as('getStudents');

  // Mock POST /students - Apenas URLs de API
  cy.intercept('POST', /http:\/\/localhost:(3001|3002|3000)\/.*\/students[^/]*$/, (req) => {
      const payload = req.body;
      const timestamp = new Date().toISOString();
      const newStudent: StudentMock = {
        id: buildId('student'),
        userId: payload.userId || buildId('user'),
        firstName: payload.firstName,
        lastName: payload.lastName,
        cpf: payload.cpf,
        email: payload.email,
        matricula: payload.matricula,
        status: 'ACTIVE',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      studentsState.push(newStudent);
    req.reply({
      statusCode: 201,
      body: newStudent,
    });
  }).as('createStudent');

  // Mock GET /students/:id - Apenas URLs de API
  cy.intercept('GET', /http:\/\/localhost:(3001|3002|3000)\/.*\/students\/[^/]+$/, (req) => {
    const studentId = req.url.split('/').pop()?.split('?')[0];
    const student = studentsState.find((s) => s.id === studentId);
    if (student) {
      req.reply({
        statusCode: 200,
        body: student,
      });
    } else {
      req.reply({
        statusCode: 404,
      });
    }
  }).as('getStudent');

  // Mock PUT /students/:id - Apenas URLs de API
  cy.intercept('PUT', /http:\/\/localhost:(3001|3002|3000)\/.*\/students\/[^/]+$/, (req) => {
    const studentId = req.url.split('/').pop()?.split('?')[0];
    const index = studentsState.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      const updated: StudentMock = {
        ...studentsState[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      studentsState[index] = updated;
      req.reply({
        statusCode: 200,
        body: updated,
      });
    } else {
      req.reply({
        statusCode: 404,
      });
    }
  }).as('updateStudent');

  // Mock DELETE /students/:id - Apenas URLs de API
  cy.intercept('DELETE', /http:\/\/localhost:(3001|3002|3000)\/.*\/students\/[^/]+$/, (req) => {
    const studentId = req.url.split('/').pop()?.split('?')[0];
    const index = studentsState.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      studentsState.splice(index, 1);
      req.reply({
        statusCode: 204,
      });
    } else {
      req.reply({
        statusCode: 404,
      });
    }
  }).as('deleteStudent');

  return { students: studentsState };
}

/**
 * Mock da API de Rooms
 */
export function mockRoomsApi(initial = defaultRooms) {
  roomsState = initial.map((room) => ({ ...room }));

  // Mock GET /rooms - Interceptar apenas URLs de API (com porta ou /api/)
  // Padrão: http://localhost:3002/api/v1/rooms ou http://localhost:3002/rooms
  cy.intercept('GET', /http:\/\/localhost:(3001|3002|3000)\/.*\/rooms[^/]*$/, {
    statusCode: 200,
    body: roomsState,
  }).as('getRooms');

  // Mock POST /rooms - Apenas URLs de API
  cy.intercept('POST', /http:\/\/localhost:(3001|3002|3000)\/.*\/rooms[^/]*$/, (req) => {
      const payload = req.body;
      const timestamp = new Date().toISOString();
      const newRoom: RoomMock = {
        id: buildId('room'),
        roomNumber: payload.roomNumber,
        type: payload.type,
        capacity: payload.capacity,
        hasEquipment: payload.hasEquipment,
        status: 'AVAILABLE',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      roomsState.push(newRoom);
    req.reply({
      statusCode: 201,
      body: newRoom,
    });
  }).as('createRoom');

  // Mock GET /rooms/:id - Apenas URLs de API
  cy.intercept('GET', /http:\/\/localhost:(3001|3002|3000)\/.*\/rooms\/[^/]+$/, (req) => {
    const roomId = req.url.split('/').pop()?.split('?')[0];
    const room = roomsState.find((r) => r.id === roomId);
    if (room) {
      req.reply({
        statusCode: 200,
        body: room,
      });
    } else {
      req.reply({
        statusCode: 404,
      });
    }
  }).as('getRoom');

  // Mock PUT /rooms/:id - Apenas URLs de API
  cy.intercept('PUT', /http:\/\/localhost:(3001|3002|3000)\/.*\/rooms\/[^/]+$/, (req) => {
    const roomId = req.url.split('/').pop()?.split('?')[0];
    const index = roomsState.findIndex((r) => r.id === roomId);
    if (index !== -1) {
      const updated: RoomMock = {
        ...roomsState[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      roomsState[index] = updated;
      req.reply({
        statusCode: 200,
        body: updated,
      });
    } else {
      req.reply({
        statusCode: 404,
      });
    }
  }).as('updateRoom');

  // Mock DELETE /rooms/:id - Apenas URLs de API
  cy.intercept('DELETE', /http:\/\/localhost:(3001|3002|3000)\/.*\/rooms\/[^/]+$/, (req) => {
    const roomId = req.url.split('/').pop()?.split('?')[0];
    const index = roomsState.findIndex((r) => r.id === roomId);
    if (index !== -1) {
      roomsState.splice(index, 1);
      req.reply({
        statusCode: 204,
      });
    } else {
      req.reply({
        statusCode: 404,
      });
    }
  }).as('deleteRoom');

  return { rooms: roomsState };
}

/**
 * Mock da API de Analytics
 */
export function mockAnalyticsApi() {
  // Mock GET /analytics/dashboard
  cy.intercept('GET', /.*\/analytics\/dashboard.*/, {
    statusCode: 200,
    body: {
      totalCheckins: 150,
      activeCheckins: 45,
      roomsOccupied: 12,
      studentsActive: 89,
      period: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
    },
  });

  // Mock GET /analytics/rooms/realtime
  cy.intercept('GET', /.*\/analytics\/rooms\/realtime.*/, {
    statusCode: 200,
    body: [
      {
        roomId: 'room-1',
        roomNumber: 'A101',
        currentOccupancy: 15,
        capacity: 40,
        occupancyRate: 0.375,
        lastCheckIn: new Date().toISOString(),
        checkInsLastHour: 8,
        checkInsLast15Minutes: 3,
        uniqueStudentsLastHour: 12,
      },
      {
        roomId: 'room-2',
        roomNumber: 'LAB-02',
        currentOccupancy: 10,
        capacity: 25,
        occupancyRate: 0.4,
        lastCheckIn: new Date().toISOString(),
        checkInsLastHour: 5,
        checkInsLast15Minutes: 2,
        uniqueStudentsLastHour: 8,
      },
    ],
  });

  // Mock GET /analytics/rooms/stats
  cy.intercept('GET', /.*\/analytics\/rooms\/stats.*/, (req) => {
    const url = new URL(req.url);
    req.reply({
      statusCode: 200,
      body: {
        roomId: url.searchParams.get('roomId') || 'room-1',
        period: {
          startDate: url.searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: url.searchParams.get('endDate') || new Date().toISOString(),
        },
        totalUsage: 120,
        totalHours: 240,
        averageUsagePerDay: 8,
      },
    });
  });

  // Mock GET /analytics/rooms/:id/timeline
  cy.intercept('GET', /.*\/analytics\/rooms\/[^/]+\/timeline.*/, (req) => {
    const url = new URL(req.url);
    const roomId = req.url.split('/').find((segment, index, arr) => 
      arr[index - 1] === 'rooms' && segment !== 'timeline'
    ) || 'room-1';
    
    req.reply({
      statusCode: 200,
      body: {
        roomId,
        period: {
          startDate: url.searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: url.searchParams.get('endDate') || new Date().toISOString(),
        },
        totalCheckins: 120,
        totalHours: 240,
        uniqueStudents: 45,
        averageCheckinsPerDay: 4,
        dailyStats: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          checkins: Math.floor(Math.random() * 10) + 1,
        })),
      },
    });
  });

  // Mock GET /analytics/students/:id/stats
  cy.intercept('GET', /.*\/analytics\/students\/[^/]+\/stats.*/, (req) => {
    const url = new URL(req.url);
    const studentId = req.url.split('/').find((segment, index, arr) => 
      arr[index - 1] === 'students' && segment !== 'stats'
    ) || 'student-1';
    
    req.reply({
      statusCode: 200,
      body: {
        studentId,
        period: {
          startDate: url.searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: url.searchParams.get('endDate') || new Date().toISOString(),
        },
        totalCheckins: 25,
        totalHours: 50,
        roomsVisited: 5,
        averageCheckinsPerDay: 0.83,
        dailyStats: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          checkins: Math.floor(Math.random() * 3),
        })),
      },
    });
  });
}

/**
 * Mock da API de autenticação
 */
export function mockAuthApi() {
  cy.intercept('POST', /.*\/auth\/login.*/, (req) => {
    const payload = req.body;
    if (payload.email && payload.password) {
      req.reply({
        statusCode: 200,
        body: {
          accessToken: 'mock-jwt-token-for-testing',
          refreshToken: 'mock-refresh-token',
          user: {
            id: 'admin-user-id',
            email: payload.email,
            role: 'ADMIN',
          },
        },
      });
    } else {
      req.reply({
        statusCode: 401,
      });
    }
  });
}

/**
 * Mock todas as APIs do Dashboard
 */
export function mockDashboardApis() {
  mockStudentsApi();
  mockRoomsApi();
  mockAnalyticsApi();
  mockAuthApi();
}

