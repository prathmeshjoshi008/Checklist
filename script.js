document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('nav-list');
    const contentArea = document.getElementById('content-area');
    const sectionTitle = document.getElementById('section-title');
    const treeContainer = document.getElementById('tree-container');

    // Fetch data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            initialize(data);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            treeContainer.innerHTML = '<p>Error loading syllabus data.</p>';
        });

    function initialize(data) {
        // Render navigation
        data.sections.forEach((section, index) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = section.title; // e.g. "1. General Aptitude"
            link.href = '#';
            link.dataset.sectionId = index; // Using index for simplicity

            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Update active state in nav
                document.querySelectorAll('#nav-list a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');

                // Render section content
                renderSection(section);
            });

            li.appendChild(link);
            navList.appendChild(li);

            // Auto-select first section
            if (index === 0) {
                link.click();
            }
        });
    }

    function renderSection(section) {
        sectionTitle.textContent = section.title;
        treeContainer.innerHTML = ''; // Clear previous content

        // Recursive function to create tree
        const treeRoot = createTree(section.children, section.id); // section.id used for unique keys
        treeContainer.appendChild(treeRoot);
    }

    function createTree(nodes, parentId) {
        if (!nodes || nodes.length === 0) return document.createElement('div'); // Return empty div if no children

        const ul = document.createElement('div'); // Using div instead of ul for easier styling
        ul.className = 'children-container expanded'; // Default expanded for now, or logical default

        nodes.forEach((node, index) => {
            // Generate a unique ID for this node based on hierarchy path
            // e.g., "1-0-2" (Section 1 -> Child 0 -> Child 2)
            const nodeId = `${parentId}-${index}`;

            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'node-header';

            // Toggle Button (only if there are children)
            const hasChildren = node.children && node.children.length > 0;
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-btn';
            toggleBtn.textContent = hasChildren ? '▶' : '•'; // Arrow or bullet
            if (!hasChildren) toggleBtn.style.visibility = 'hidden'; // Or just show bullet

            if (hasChildren) {
                toggleBtn.addEventListener('click', () => {
                   const childrenContainer = nodeDiv.querySelector('.children-container');
                   const isExpanded = childrenContainer.classList.contains('expanded');

                   if (isExpanded) {
                       childrenContainer.classList.remove('expanded');
                       toggleBtn.classList.remove('expanded');
                   } else {
                       childrenContainer.classList.add('expanded');
                       toggleBtn.classList.add('expanded');
                   }
                });
            }

            // Checkbox
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `check-${nodeId}`;

            // Load state from LocalStorage
            const savedState = localStorage.getItem(`check-${nodeId}`);
            if (savedState === 'true') {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', () => {
                localStorage.setItem(`check-${nodeId}`, checkbox.checked);
                // Optional: Update visual style immediately if needed (CSS handles line-through via + selector)
            });

            checkboxWrapper.appendChild(checkbox);

            // Label
            const label = document.createElement('label');
            label.className = 'node-label';
            label.htmlFor = `check-${nodeId}`;
            label.textContent = node.title;

            headerDiv.appendChild(toggleBtn);
            headerDiv.appendChild(checkboxWrapper);
            headerDiv.appendChild(label);
            nodeDiv.appendChild(headerDiv);

            // Recursive Children
            if (hasChildren) {
                const childrenTree = createTree(node.children, nodeId);
                // Default state: Expanded or Collapsed? Let's default to expanded for top levels, maybe collapsed deep down?
                // For now, let's keep it expanded by default as per 'expanded' class on container
                toggleBtn.classList.add('expanded');
                nodeDiv.appendChild(childrenTree);
            }

            ul.appendChild(nodeDiv);
        });

        return ul;
    }
});