// Removed shader loading functionality and background color updates
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebar.classList.toggle('collapsed');
    document.querySelector('.content').style.marginLeft = sidebar.classList.contains('active') ? 'var(--sidebar-width)' : '0';
});