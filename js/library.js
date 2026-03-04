// The Golden Oak Library - Logic

import { supabase, isConfigured } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const bookshelfArea = document.getElementById('bookshelf-area');
    const searchInput = document.getElementById('book-search');
    const searchStats = document.getElementById('search-stats');
    const surpriseBtn = document.getElementById('surprise-btn');

    // Modal Elements
    const modal = document.getElementById('book-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCover = document.getElementById('modal-cover');
    const modalTitle = document.getElementById('modal-title');
    const modalAuthor = document.getElementById('modal-author');
    const modalDesc = document.getElementById('modal-desc');
    const modalReadBtn = document.getElementById('modal-read-btn');
    const modalDownBtn = document.getElementById('modal-down-btn');

    let allBooks = [];

    // Helper: Shuffle array (Fisher-Yates)
    function shuffleArray(array) {
        let curId = array.length;
        while (0 !== curId) {
            let randId = Math.floor(Math.random() * curId);
            curId -= 1;
            let tmp = array[curId];
            array[curId] = array[randId];
            array[randId] = tmp;
        }
        return array;
    }

    if (!isConfigured) {
        searchStats.innerHTML = `<span style="color:red">Supabase Not Configured! Please review the chat instructions to set up your database.</span>`;
        return;
    }

    // Fetch the book data from Supabase Postgres
    try {
        const { data: books, error } = await supabase
            .from('library')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allBooks = books;

        // Randomize order on initial load
        allBooks = shuffleArray(allBooks);
        renderBooks(allBooks);
    } catch (error) {
        console.error('Error fetching from Supabase Postgres:', error);
        searchStats.innerHTML = `<span style="color:red">Error loading cloud library. Check console.</span>`;
    }

    // Handle Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredBooks = allBooks.filter(book => {
            return book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.description.toLowerCase().includes(searchTerm);
        });
        renderBooks(filteredBooks);
    });

    // Surprise Me!
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', () => {
            if (allBooks.length === 0) return;
            const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
            openModal(randomBook);
        });
    }

    function renderBooks(booksToRender) {
        bookshelfArea.innerHTML = '';

        if (booksToRender.length === 0) {
            searchStats.textContent = `No books found matching "${searchInput.value}".`;
            return;
        }

        if (searchInput.value.trim() === '') {
            searchStats.textContent = `Displaying all ${booksToRender.length} books in the archive.`;
        } else {
            searchStats.textContent = `Found ${booksToRender.length} matching books.`;
        }

        // Calculate books per shelf row
        const booksPerShelf = 20;

        for (let i = 0; i < booksToRender.length; i += booksPerShelf) {
            const rowBooks = booksToRender.slice(i, i + booksPerShelf);
            const shelfRow = document.createElement('div');
            shelfRow.className = 'shelf-row';

            rowBooks.forEach(book => {
                const bookItem = createBookElement(book);
                shelfRow.appendChild(bookItem);
            });
            bookshelfArea.appendChild(shelfRow);
        }
    }

    // Generate deterministic spine color from title hash
    function getColorFromTitle(title) {
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colors = [
            '#4a1f24', // Deep red
            '#1f3a28', // Forest green
            '#2a3b5c', // Navy blue
            '#5c3a21', // Brown
            '#402b45', // Plum
            '#2c2c2c', // Charcoal
            '#6b5a3e'  // Olive brown
        ];

        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    function createBookElement(book) {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-item';
        bookDiv.addEventListener('click', () => openModal(book));

        // Generate deterministic organic height based on title hash (160px - 200px)
        let heightHash = 0;
        for (let i = 0; i < book.title.length; i++) { heightHash += book.title.charCodeAt(i); }
        const randomHeight = 160 + (heightHash % 40);
        bookDiv.style.height = `${randomHeight}px`;

        // Create the 3D rotating container
        const spineContainer = document.createElement('div');
        spineContainer.className = 'book-spine-container';

        // 1. The visible Spine
        const spine = document.createElement('div');
        spine.className = 'book-spine';

        const spineColor = getColorFromTitle(book.title);
        const textColor = (heightHash % 3 === 0) ? '#e5b975' : '#ffffff';

        spine.style.setProperty('--spine-color', spineColor);
        spine.style.setProperty('--text-color', textColor);

        const spineText = document.createElement('div');
        spineText.className = 'spine-text';
        spineText.textContent = book.title;
        spine.appendChild(spineText);

        // 2. The hidden Cover
        const bookCover = document.createElement('div');
        bookCover.className = 'book-cover';

        const img = document.createElement('img');
        img.src = book.coverImage;
        img.alt = `Cover of ${book.title}`;
        img.loading = "lazy";

        bookCover.appendChild(img);

        // Assemble
        spineContainer.appendChild(spine);
        spineContainer.appendChild(bookCover);
        bookDiv.appendChild(spineContainer);

        return bookDiv;
    }

    // Modal Logic
    function openModal(book) {
        modalCover.src = book.coverImage;
        modalTitle.textContent = book.title;
        modalAuthor.textContent = `by ${book.author}`;
        modalDesc.textContent = book.description;
        modalReadBtn.href = `reader.html?id=${book.id}`;
        modalDownBtn.href = book.downloadUrl;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(); // Click outside to close
        });
    }
});
