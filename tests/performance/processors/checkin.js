function generateUniqueSuffix() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

module.exports = {
  generateCheckinPayload: function (context, events, done) {
    const suffix = generateUniqueSuffix();
    context.vars.studentId = `stress-student-${suffix}`;
    context.vars.identificationValue = `M-${suffix.toUpperCase()}`;

    if (!context.vars.roomId) {
      context.vars.roomId = 'stress-room-1';
    }

    return done();
  },
};


