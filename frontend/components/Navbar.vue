
<template>
    <nav>
        <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/create">Crear</a></li>
            <li><a href="/edit">Editar</a></li>
            <li><a href="/share">Compartir</a></li>
            <li><a href="/export">Exportar</a></li>
            <li><a href="/comment">Comentar</a></li>
        </ul>
    </nav>
</template>

<style scoped>
nav {
    background-color: #333;
    color: white;
    padding: 1rem;
}
ul {
    list-style: none;
    display: flex;
    gap: 1rem;
}
a {
    color: white;
    text-decoration: none;
}
</style>
