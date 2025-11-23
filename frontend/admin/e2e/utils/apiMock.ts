import { Page, Route } from '@playwright/test';

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

const jsonHeaders = { 'content-type': 'application/json' };

const defaultStudents: StudentMock[] = [
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

const defaultRooms: RoomMock[] = [
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

const buildId = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;

const fulfill = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });

export async function mockStudentsApi(page: Page, initial = defaultStudents) {
  const students = initial.map((student) => ({ ...student }));

  // Interceptar todas as URLs de students (com ou sem baseURL)
  await page.route(/.*\/students.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const segments = url.pathname.split('/').filter(Boolean);
    const resource = segments[segments.length - 1];
    // Verificar se é a coleção students ou um recurso específico
    const isCollection = resource === 'students' || (segments.length > 0 && segments[segments.length - 2] === 'students' && !segments[segments.length - 1].includes('-'));

    if (isCollection && method === 'GET') {
      return fulfill(route, students);
    }

    if (isCollection && method === 'POST') {
      const payload = request.postDataJSON();
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
      students.push(newStudent);
      return fulfill(route, newStudent, 201);
    }

    const studentId = resource;
    const index = students.findIndex((student) => student.id === studentId);

    if (index === -1) {
      return route.fulfill({ status: 404 });
    }

    if (method === 'GET') {
      return fulfill(route, students[index]);
    }

    if (method === 'PUT') {
      const payload = request.postDataJSON();
      const updated: StudentMock = {
        ...students[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      students[index] = updated;
      return fulfill(route, updated);
    }

    if (method === 'DELETE') {
      students.splice(index, 1);
      return route.fulfill({ status: 204 });
    }

    return route.continue();
  });

  return { students };
}

export async function mockRoomsApi(page: Page, initial = defaultRooms) {
  const rooms = initial.map((room) => ({ ...room }));

  // Interceptar todas as URLs de rooms (com ou sem baseURL)
  await page.route(/.*\/rooms.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const segments = url.pathname.split('/').filter(Boolean);
    const resource = segments[segments.length - 1];
    // Verificar se é a coleção rooms ou um recurso específico
    const isCollection = resource === 'rooms' || (segments.length > 0 && segments[segments.length - 2] === 'rooms' && !segments[segments.length - 1].includes('-'));

    if (isCollection && method === 'GET') {
      return fulfill(route, rooms);
    }

    if (isCollection && method === 'POST') {
      const payload = request.postDataJSON();
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
      rooms.push(newRoom);
      return fulfill(route, newRoom, 201);
    }

    const roomId = resource;
    const index = rooms.findIndex((room) => room.id === roomId);

    if (index === -1) {
      return route.fulfill({ status: 404 });
    }

    if (method === 'GET') {
      return fulfill(route, rooms[index]);
    }

    if (method === 'PUT') {
      const payload = request.postDataJSON();
      const updated: RoomMock = {
        ...rooms[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      rooms[index] = updated;
      return fulfill(route, updated);
    }

    if (method === 'DELETE') {
      rooms.splice(index, 1);
      return route.fulfill({ status: 204 });
    }

    return route.continue();
  });

  return { rooms };
}

/**
 * Mock da API de Analytics
 * Necessário porque o Dashboard faz requisições para analytics
 */
export async function mockAnalyticsApi(page: Page) {
  await page.route(/.*\/analytics.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    // Dashboard stats
    if (path.includes('/analytics/dashboard') && method === 'GET') {
      return fulfill(route, {
        totalCheckins: 150,
        activeCheckins: 45,
        roomsOccupied: 12,
        studentsActive: 89,
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      });
    }

    // Realtime occupancy
    if (path.includes('/analytics/rooms/realtime') && method === 'GET') {
      return fulfill(route, [
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
      ]);
    }

    // Room stats
    if (path.includes('/analytics/rooms/stats') && method === 'GET') {
      return fulfill(route, {
        roomId: url.searchParams.get('roomId') || 'room-1',
        period: {
          startDate: url.searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: url.searchParams.get('endDate') || new Date().toISOString(),
        },
        totalUsage: 120,
        totalHours: 240,
        averageUsagePerDay: 8,
      });
    }

    // Room timeline
    if (path.includes('/analytics/rooms/') && path.includes('/timeline') && method === 'GET') {
      const roomId = path.split('/').filter(Boolean).find((segment, index, arr) => 
        arr[index - 1] === 'rooms' && segment !== 'timeline'
      ) || 'room-1';
      
      return fulfill(route, {
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
      });
    }

    // Student stats
    if (path.includes('/analytics/students/') && path.includes('/stats') && method === 'GET') {
      const studentId = path.split('/').filter(Boolean).find((segment, index, arr) => 
        arr[index - 1] === 'students' && segment !== 'stats'
      ) || 'student-1';
      
      return fulfill(route, {
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
      });
    }

    // Default: continue with request (não mockar)
    return route.continue();
  });
}

export async function mockDashboardApis(page: Page) {
  const students = await mockStudentsApi(page);
  const rooms = await mockRoomsApi(page);
  await mockAnalyticsApi(page); // ✅ CRÍTICO: Dashboard precisa de analytics
  return { students, rooms };
}


