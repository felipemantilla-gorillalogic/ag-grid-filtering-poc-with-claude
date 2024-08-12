<template>
    <div class="car-grid-container">
        <h1>AI-Powered Car Grid</h1>
        <div class="ai-filter-container">
            <input v-model="aiFilterQuery"
                placeholder="Enter your filter query in natural language"
                class="ai-filter-input" />
            <button @click="applyAIFilter" class="ai-filter-button" :disabled="isLoading">
                {{ isLoading ? 'Applying...' : 'Apply AI Filter' }}
            </button>
        </div>
        <ag-grid-vue style="height: 600px; width: 70vw;" class="ag-theme-quartz" :columnDefs="columnDefs"
            :rowData="rowData" :defaultColDef="defaultColDef" :pagination="true" :paginationPageSize="10"
            :animateRows="true" @grid-ready="onGridReady"></ag-grid-vue>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridVue } from "ag-grid-vue3";

export default {
    name: "AICarGrid",
    components: {
        AgGridVue,
    },
    setup() {
        const gridApi = ref(null);
        const aiFilterQuery = ref('');
        const isLoading = ref(false);

        const columnDefs = ref([
            { field: "make", filter: true, floatingFilter: true },
            { field: "model", filter: true, floatingFilter: true },
            {
                field: "price",
                filter: 'agNumberColumnFilter',
                floatingFilter: true,
                valueFormatter: (params) => `$${params.value.toLocaleString()}`
            },
            {
                field: "electric",
                filter: "boolean",
                floatingFilter: true,
                cellRenderer: (params) => params.value ? '✅' : '❌'
            },
            {
                field: "year",
                filter: 'agNumberColumnFilter',
                floatingFilter: true
            },
            {
                field: "rating",
                filter: 'agNumberColumnFilter',
                floatingFilter: true,
                cellRenderer: (params) => '⭐'.repeat(params.value)
            },
            {
                field: "topSpeed",
                headerName: "Top Speed (mph)",
                filter: 'agNumberColumnFilter',
                floatingFilter: true
            },
        ]);

        const defaultColDef = {
            flex: 1,
            minWidth: 100,
            sortable: true,
            resizable: true,
        };

        const rowData = ref([
            { make: "Tesla", model: "Model Y", price: 64950, electric: true, year: 2023, rating: 4, topSpeed: 155 },
            { make: "Ford", model: "F-150 Lightning", price: 59900, electric: true, year: 2023, rating: 4, topSpeed: 110 },
            { make: "Toyota", model: "Corolla", price: 29600, electric: false, year: 2023, rating: 3, topSpeed: 118 },
            { make: "Honda", model: "Civic", price: 28600, electric: false, year: 2023, rating: 4, topSpeed: 137 },
            { make: "Chevrolet", model: "Bolt EV", price: 31995, electric: true, year: 2023, rating: 4, topSpeed: 93 },
            { make: "Nissan", model: "Leaf", price: 28040, electric: true, year: 2023, rating: 3, topSpeed: 90 },
            { make: "BMW", model: "i4", price: 67300, electric: true, year: 2023, rating: 5, topSpeed: 140 },
            { make: "Audi", model: "e-tron GT", price: 104900, electric: true, year: 2023, rating: 5, topSpeed: 152 },
            { make: "Hyundai", model: "IONIQ 5", price: 41450, electric: true, year: 2023, rating: 4, topSpeed: 115 },
            { make: "Kia", model: "EV6", price: 48700, electric: true, year: 2023, rating: 4, topSpeed: 117 },
            { make: "Volkswagen", model: "ID.4", price: 41230, electric: true, year: 2023, rating: 4, topSpeed: 99 },
            { make: "Porsche", model: "Taycan", price: 86700, electric: true, year: 2023, rating: 5, topSpeed: 161 },
            { make: "Toyota", model: "Prius Prime", price: 32350, electric: false, year: 2023, rating: 4, topSpeed: 112 },
            { make: "Mazda", model: "CX-5", price: 26700, electric: false, year: 2023, rating: 4, topSpeed: 130 },
            { make: "Subaru", model: "Outback", price: 28395, electric: false, year: 2023, rating: 4, topSpeed: 130 },
        ]);

        const onGridReady = (params) => {
            gridApi.value = params.api;
        };

        const applyAIFilter = async () => {
            if (!aiFilterQuery.value) {
                return gridApi.value.setFilterModel(null);
            };

            isLoading.value = true;
            try {
                const apiEndpoint = 'http://localhost:3000/api/claude';
                const claudeResponse = await processNaturalLanguageQuery(aiFilterQuery.value, columnDefs.value, apiEndpoint);
                applyFilters(claudeResponse);
            } catch (error) {
                console.error("Error applying AI filter:", error);
                alert("An error occurred while applying the AI filter. Please try again.");
            } finally {
                isLoading.value = false;
            }
        };

        const processNaturalLanguageQuery = async (query, columnDefinitions, apiEndpoint) => {
    try {
        // Convert column definitions to a string format for the prompt
        const columnDefsString = columnDefinitions.map(col => {
            let filterType = col.filterType || 'text';
            return `- ${col.field}: ${filterType} filter${col.label ? ` (labeled as "${col.label}")` : ''}`;
        }).join('\n');

        // Generate an example based on column definitions
        const exampleQuery = "Show me items with property A containing X, property B less than 100, and property C equal to true";
        const exampleResponse = columnDefinitions.reduce((acc, col) => {
            if (['propertyA', 'propertyB', 'propertyC'].includes(col.field)) {
                let exampleFilter;
                switch (col.field) {
                    case 'propertyA':
                        exampleFilter = { filter: 'X', filterType: 'text', type: 'contains' };
                        break;
                    case 'propertyB':
                        exampleFilter = { filter: 100, filterType: 'number', type: 'lessThan' };
                        break;
                    case 'propertyC':
                        exampleFilter = { filter: true, filterType: 'boolean', type: 'equals' };
                        break;
                }
                acc[col.field] = exampleFilter;
            }
            return acc;
        }, {});

        const response = await axios.post(apiEndpoint, {
            prompt: `
            You are an AI assistant specialized in processing natural language queries into filters for data grids. Your task is to analyze the given query and return a JSON object representing the filters based on the following column definitions:

Column Definitions:
${columnDefsString}

Given a natural language query, return a JSON object where each key is a column field and each value is an object with the following properties:
- 'filter': the value to filter by
- 'filterType': the data type of the filter (e.g., 'text', 'number', 'boolean')
- 'type': the filter operation to apply (e.g., 'contains', 'equals', 'lessThan', 'greaterThan')

For example, given the query:
"${exampleQuery}"

You should return:
${JSON.stringify(exampleResponse, null, 2)}

Now, process the following query and return the appropriate JSON filter object as string to be parsed, based on the column definitions provided above:

${query}`,
        });

        return response.data;
    } catch (error) {
        console.error("Error processing natural language query:", error);
        throw error;
    }
};

        const applyFilters = (filters) => {
            const parsedFilters = JSON.parse(filters);
            console.log("filters", parsedFilters)
            gridApi.value.setFilterModel(parsedFilters);
            console.log(gridApi.value.getFilterModel())
        };

        onMounted(() => {
            // You can perform any additional setup here if needed
        });

        return {
            columnDefs,
            rowData,
            defaultColDef,
            onGridReady,
            aiFilterQuery,
            applyAIFilter,
            isLoading,
        };
    },
};
</script>

<style scoped>
.car-grid-container {
    width: 100%;
    font-family: Arial, sans-serif;
    margin: 0 auto;
    padding: 20px;
    flex: auto;
    display: flex;
    flex-direction: column;
}

h1 {
    text-align: center;
    color: #333;
}

.ai-filter-container {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.ai-filter-input {
    flex-grow: 1;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.ai-filter-button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.ai-filter-button:hover {
    background-color: #45a049;
}

.ai-filter-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style>