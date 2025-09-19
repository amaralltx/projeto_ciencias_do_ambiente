// Environmental Manual JavaScript

// Mind map data
const mindMapData = {
  "meta": {
    "name": "Manual Ambiental",
    "version": "1.0"
  },
  "format": "node_tree",
  "data": {
    "id": "root",
    "topic": "Ciências do Ambiente",
    "children": [
      {
        "id": "gestao_ambiental",
        "topic": "Gestão Ambiental",
        "direction": "left",
        "children": [
          {
            "id": "sustentabilidade",
            "topic": "Sustentabilidade",
            "children": [
              { "id": "espacial", "topic": "Espacial" },
              { "id": "social", "topic": "Social" },
              { "id": "ecologica", "topic": "Ecológica" },
              { "id": "economica", "topic": "Econômica" },
              { "id": "cultural", "topic": "Cultural" }
            ]
          },
          { "id": "preservacao_ambiental", "topic": "Preservação Ambiental" },
          { "id": "licenciamento_ambiental", "topic": "Licenciamento Ambiental" }
        ]
      },
      {
        "id": "pilares_desenvolvimento",
        "topic": "Pilares do Desenvolvimento Sustentável",
        "direction": "left",
        "children": [
          { "id": "pilar_economico", "topic": "Econômico" },
          { "id": "pilar_social", "topic": "Social" },
          { "id": "pilar_ambiental", "topic": "Ambiental" }
        ]
      },
      {
        "id": "economia_verde",
        "topic": "Economia Verde",
        "direction": "right",
        "children": [
          { "id": "oferta_empregos", "topic": "Oferta de Empregos" },
          { "id": "consumo_consciente", "topic": "Consumo Consciente" },
          { "id": "reciclagem_reutilizacao", "topic": "Reciclagem e Reutilização" },
          { "id": "energia_limpa_renovavel", "topic": "Energia Limpa e Renovável" },
          { "id": "conservacao_ambiental", "topic": "Conservação Ambiental" },
          { "id": "reducao_desigualdades_conservacao_ambiental", "topic": "Redução das Desigualdades Sociais" },
          { "id": "melhor_qualidade_vida", "topic": "Melhor Qualidade de Vida para Todos" }
        ]
      },
      {
        "id": "desenvolvimento_sustentavel",
        "topic": "Desenvolvimento Sustentável",
        "direction": "right",
        "children": [
          {
            "id": "agenda_2030",
            "topic": "Agenda 2030",
            "children": [
              { "id": "169_metas_ods", "topic": "169 Metas" },
              { "id": "17_objetivos_ods", "topic": "17 Objetivos" }
            ]
          },
          { "id": "kyoto", "topic": "Protocolo de Kyoto" }
        ]
      },
      {
        "id": "certificacoes_ambientais",
        "topic": "Certificações Ambientais",
        "direction": "right"
      }
    ]
  }
};

// jsMind options
const mindMapOptions = {
  container: 'jsmind_container',
  mode: 'full',
  theme: 'greensea',
  editable: false,
  selectable: true,
  collapsible: false,
  view: {
    hmargin: 0,
    vmargin: 0,
    line_width: 2,
    line_color: '#547768ff',
    engine: 'canvas',
    draggable: true,
    hide_scrollbars_when_draggable: true,
    zoom: 0.5
  },
  layout: {
    hspace: 18,
    vspace: 35,
    pspace: 10
  },
  shortcut: {
    enable: true
  }
};

let jsMindInstance = null;
let currentNodeId = null; // track which topic is open for editing

document.addEventListener('DOMContentLoaded', function () {
  initializePage();
});

function initializePage() {
  initializeMindMap();
}

function initializeMindMap() {
  try {
    jsMindInstance = new jsMind(mindMapOptions);
    jsMindInstance.show(mindMapData);

    setTimeout(() => {
      setupMindMapClickEvents();
    }, 500);

  } catch (error) {
    console.error('Error initializing mind map:', error);
    showFallbackMessage();
  }
}

function setupMindMapClickEvents() {
  if (!jsMindInstance) return;

  const mindMapContainer = document.getElementById('jsmind_container');
  if (mindMapContainer) {
    mindMapContainer.addEventListener('click', function (event) {
      const clickedElement = event.target;

      if (clickedElement && (clickedElement.tagName === 'JMNODE' || clickedElement.closest('jmnode'))) {
        const nodeElement = clickedElement.tagName === 'JMNODE' ? clickedElement : clickedElement.closest('jmnode');
        const nodeId = nodeElement.getAttribute('nodeid');

        if (nodeId) {
          const topic = getNodeTopicById(nodeId);
          console.log('Mapa mental - nó clicado:', nodeId, topic || 'tópico desconhecido');

          clearSelectedNodes();

          setTimeout(() => {
            nodeElement.style.transform = '';
            nodeElement.style.boxShadow = '';
          }, 350);

          showSidebarForNode(nodeId, topic);
        }
      }
    });
  }
}

function showSidebarForNode(nodeId, topic) {
  const sidebar = document.getElementById('sidebar');
  const content = sidebar.querySelector('.sidebar-content');
  currentNodeId = nodeId;
  const saved = getSavedContent(nodeId);
  const base = topicContent[nodeId] || `<h3>${topic || 'Tópico'}</h3><p>Descrição não disponível.</p>`;
  // Prefer saved HTML if present
  content.innerHTML = saved || base;

  // Bind autosave on input without duplicating listener
  content.oninput = function () {
    // Save on each edit for persistence per browser
    if (currentNodeId) {
      saveContent(currentNodeId, content.innerHTML);
    }
  };
  sidebar.classList.remove('hidden');
  sidebar.setAttribute('aria-hidden', 'false');
}

function hideSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.add('hidden');
  sidebar.setAttribute('aria-hidden', 'true');
  clearSelectedNodes();
}

function clearSelectedNodes() {
  const map = document.getElementById('jsmind_container');
  if (!map) return;
  const selected = map.querySelectorAll('.selected-node');
  selected.forEach(el => el.classList.remove('selected-node'));
}

document.addEventListener('click', function (e) {
  if (e.target && e.target.classList && e.target.classList.contains('sidebar-close')) {
    hideSidebar();
  }
});

function getNodeTopicById(nodeId) {
  if (!mindMapData || !mindMapData.data) return null;

  const stack = [mindMapData.data];
  while (stack.length) {
    const node = stack.pop();
    if (node.id === nodeId) return node.topic;
    if (node.children && node.children.length) {
      for (let i = 0; i < node.children.length; i++) {
        stack.push(node.children[i]);
      }
    }
  }
  return null;
}

// --- Persistence helpers (per-browser) ---
const STORAGE_KEY = 'manual-ambiental-topic-overrides';

function getOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Falha ao ler overrides do localStorage:', e);
    return {};
  }
}

function saveOverrides(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Falha ao salvar overrides no localStorage:', e);
  }
}

function getSavedContent(nodeId) {
  const map = getOverrides();
  return map[nodeId] || null;
}

function saveContent(nodeId, html) {
  const map = getOverrides();
  map[nodeId] = html;
  saveOverrides(map);
}

