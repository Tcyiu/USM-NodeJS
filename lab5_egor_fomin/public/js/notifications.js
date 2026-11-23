(() => {
    if (typeof io !== 'function') return;

    const socket = io();
    const container = document.getElementById('notifications');

    socket.on('courseCreated', (course) => {
        if (!container) return;

        const notification = document.createElement('article');
        notification.className = 'notification-card';
        const title = document.createElement('strong');
        title.textContent = `Добавлен новый курс: ${course.title}`;
        const teacher = document.createElement('p');
        teacher.textContent = `Преподаватель: ${course.teacherName}`;
        const time = document.createElement('small');
        time.textContent = new Date(course.createdAt).toLocaleString('ru-RU');
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'notification-close';
        close.setAttribute('aria-label', 'Закрыть уведомление');
        close.textContent = '×';
        close.addEventListener('click', () => notification.remove());

        notification.append(close, title, teacher, time);
        container.prepend(notification);
        window.setTimeout(() => notification.remove(), 10000);
    });
})();
