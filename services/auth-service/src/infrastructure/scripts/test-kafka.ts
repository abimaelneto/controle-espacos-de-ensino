import { Kafka } from 'kafkajs';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../../../.env.local') });

async function testKafka() {
  const brokers = process.env.KAFKA_BROKERS || 'localhost:9092';

  console.log('🔄 Tentando conectar ao Kafka...');
  console.log(`📍 Brokers: ${brokers}`);

  const kafka = new Kafka({
    clientId: 'test-client',
    brokers: brokers.split(','),
  });

  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log('✅ Conectado ao Kafka com sucesso!');

    // Listar tópicos
    const topics = await admin.listTopics();
    console.log('✅ Tópicos disponíveis:', topics);

    // Criar tópico de teste se não existir
    const testTopic = 'test-topic';
    if (!topics.includes(testTopic)) {
      await admin.createTopics({
        topics: [
          {
            topic: testTopic,
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      console.log(`✅ Tópico "${testTopic}" criado`);
    }

    // Testar producer
    const producer = kafka.producer();
    await producer.connect();
    console.log('✅ Producer conectado');

    await producer.send({
      topic: testTopic,
      messages: [
        {
          key: 'test-key',
          value: JSON.stringify({ message: 'Test message', timestamp: new Date() }),
        },
      ],
    });
    console.log('✅ Mensagem enviada com sucesso');

    // Testar consumer
    const consumer = kafka.consumer({ groupId: 'test-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: testTopic, fromBeginning: true });
    console.log('✅ Consumer conectado e inscrito');

    await producer.disconnect();
    await consumer.disconnect();
    await admin.disconnect();

    console.log('✅ Todos os testes passaram!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testKafka();

