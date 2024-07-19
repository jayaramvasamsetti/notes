document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    document.getElementById('create-note').addEventListener('click', function() {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim());

        fetch('/notes', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Note created successfully!');
                document.getElementById('note-title').value = '';
                document.getElementById('note-content').value = '';
                document.getElementById('note-tags').value = '';
                fetchNotes();
            })
            .catch(error => {
                console.error('Error creating note:', error);
                alert('Error creating note. Please try again.');
            });
    });

    function fetchNotes() {
        fetch('/notes', {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
            .then(response => response.json())
            .then(notes => {
                const notesContainer = document.getElementById('notes');
                notesContainer.innerHTML = '';
                notes.forEach(note => {
                    const noteElement = createNoteElement(note);
                    notesContainer.appendChild(noteElement);
                });
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
                alert('Error fetching notes. Please try again.');
            });
    }

    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.dataset.id = note._id;
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <p>Tags: ${note.tags.join(', ')}</p>
            <button class="archive-note">Archive</button>
            <button class="delete-note">Delete</button>
            <button class="change-color">Change Color</button>
        `;

        noteElement.querySelector('.archive-note').addEventListener('click', function() {
            archiveNote(note._id);
        });

        noteElement.querySelector('.delete-note').addEventListener('click', function() {
            deleteNote(note._id);
        });

        noteElement.querySelector('.change-color').addEventListener('click', function() {
            changeNoteColor(note._id);
        });

        return noteElement;
    }

    function archiveNote(noteId) {
        fetch(`/notes/${noteId}/archive`, {
                method: 'PUT',
                headers: {
                    'Authorization': token
                }
            })
            .then(response => response.json())
            .then(data => {
                alert('Note archived successfully!');
                fetchNotes();
            })
            .catch(error => {
                console.error('Error archiving note:', error);
                alert('Error archiving note. Please try again.');
            });
    }

    function deleteNote(noteId) {
        fetch(`/notes/${noteId}/trash`, {
                method: 'PUT',
                headers: {
                    'Authorization': token
                }
            })
            .then(response => response.json())
            .then(data => {
                alert('Note trashed successfully!');
                fetchNotes();
            })
            .catch(error => {
                console.error('Error trashing note:', error);
                alert('Error trashing note. Please try again.');
            });
    }

    function changeNoteColor(noteId) {
        const colors = ['#fff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb'];
        const newColor = colors[Math.floor(Math.random() * colors.length)];

        fetch(`/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    color: newColor
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Note color changed successfully!');
                fetchNotes();
            })
            .catch(error => {
                console.error('Error changing note color:', error);
                alert('Error changing note color. Please try again.');
            });
    }

    document.getElementById('search').addEventListener('keyup', function() {
        const query = this.value;

        fetch(`/notes/search?query=${query}`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
            .then(response => response.json())
            .then(notes => {
                const notesContainer = document.getElementById('notes');
                notesContainer.innerHTML = '';
                notes.forEach(note => {
                    const noteElement = createNoteElement(note);
                    notesContainer.appendChild(noteElement);
                });
            })
            .catch(error => {
                console.error('Error searching notes:', error);
                alert('Error searching notes. Please try again.');
            });
    });

    // Fetch notes on page load
    fetchNotes();
});