const STORAGE_KEY = 'storageMarMaterials';

function loadMaterials() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveMaterials(materials) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
}

function getStatusBadge(quantity) {
    if (quantity > 20) return { class: 'status-ok', text: 'OK ✓' };
    if (quantity > 10) return { class: 'status-low', text: 'Niski ⚠️' };
    return { class: 'status-critical', text: 'Bardzo niski 🔴' };
}

function renderMaterials(materials = null) {
    const materialsList = document.getElementById('materialsList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let items = materials || loadMaterials();
    items = items.filter(item => 
        item.nazwa.toLowerCase().includes(searchTerm) ||
        item.kod.toLowerCase().includes(searchTerm)
    );
    
    if (items.length === 0) {
        materialsList.innerHTML = '<div class="empty-state">Brak materiałów. Dodaj nowy! ➕</div>';
        return;
    }
    
    materialsList.innerHTML = items.map((item, index) => {
        const status = getStatusBadge(item.ilosc);
        const rolls = (item.ilosc / 50).toFixed(2);
        
        return `
            <div class="material-card">
                <h3>${item.nazwa}</h3>
                <div class="material-info">
                    <strong>Kod:</strong> ${item.kod}
                </div>
                <div class="material-info">
                    <strong>Typ:</strong> ${item.typ}
                </div>
                <div class="material-info">
                    <strong>Ilość:</strong> ${item.ilosc} mb
                </div>
                <div class="material-info">
                    <strong>Rolki:</strong> ${rolls} szt.
                </div>
                <span class="status-badge ${status.class}">${status.text}</span>
                
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="adjustQuantity(${index}, -10)">-10</button>
                    <button class="qty-btn" onclick="adjustQuantity(${index}, -1)">-1</button>
                    <button class="qty-btn" onclick="adjustQuantity(${index}, +1)">+1</button>
                    <button class="qty-btn" onclick="adjustQuantity(${index}, +10)">+10</button>
                    <button class="qty-btn delete-btn" onclick="deleteMaterial(${index})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function adjustQuantity(index, amount) {
    let materials = loadMaterials();
    materials[index].ilosc = Math.max(0, materials[index].ilosc + amount);
    saveMaterials(materials);
    renderMaterials(materials);
}

function deleteMaterial(index) {
    if (confirm('Czy na pewno usunąć ten materiał?')) {
        let materials = loadMaterials();
        materials.splice(index, 1);
        saveMaterials(materials);
        renderMaterials(materials);
    }
}

document.getElementById('addForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newMaterial = {
        nazwa: document.getElementById('nazwa').value,
        kod: document.getElementById('kod').value,
        ilosc: parseInt(document.getElementById('ilosc').value),
        typ: document.getElementById('typ').value,
        dataDodania: new Date().toLocaleString('pl-PL')
    };
    
    let materials = loadMaterials();
    materials.push(newMaterial);
    saveMaterials(materials);
    
    document.getElementById('addForm').reset();
    switchView('listaView');
    renderMaterials();
});

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchView(btn.dataset.view);
    });
});

document.getElementById('searchInput').addEventListener('input', () => {
    renderMaterials();
});

const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const closeAdminBtn = document.getElementById('closeAdminBtn');

adminBtn.addEventListener('click', () => {
    adminPanel.classList.remove('hidden');
});

closeAdminBtn.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
});

adminPanel.addEventListener('click', (e) => {
    if (e.target === adminPanel) {
        adminPanel.classList.add('hidden');
    }
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const materials = loadMaterials();
    const json = JSON.stringify(materials, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magazyn-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Dane wyeksportowane!');
});

document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('⚠️ Czy na pewno chcesz usunąć WSZYSTKIE dane?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderMaterials([]);
        adminPanel.classList.add('hidden');
        alert('✅ Dane wyczyszczone!');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderMaterials();
});
