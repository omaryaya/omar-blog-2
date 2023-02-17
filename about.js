function yearsOfExperience() {
  document.getElementById("yearsOfExperience").innerText = `${
    new Date().getFullYear() - 2016
  }`;
}

// Path: about.js
yearsOfExperience();

// Path: about.js
const tableHeaders = [
  "Back-end",
  "Cloud",
  "Database",
  "Front-end",
  "DevOps | Misc.",
];
const tableData = [
  ["*Java (17+)", "AWS", "*SQL", "*React JS", "Git"],
  ["*Spring", "Docker", "*NoSQL", "*JavaScript", "*Github"],
  ["Spring Data", "Azure", "PostgreSQL", "TypeScript", "Gradle | Maven"],
  ["Hibernate", "Kubernetes", "MongoDb", "*NodeJS", "NPM | Yarn"],
  ["JPA", "Google Cloud GCP", "ElasticSearch", "HTML", "Gradle"],
  ["REST", "CircleCI", "Neo4j", "CSS", "*JUnit"],
  ["*NodeJS", "Netlify", "MySQL", "Ant Design", "RestAssured"],
  ["ExpressJS", "Jenkins", "Kafka", "MaterialUI", "React Testing Library"],
  ["", "", "Redis", "Bootstrap", "Jest"],
];
function createTable(tableData) {
  var table = document.createElement("table");
  var tableHeader = document.createElement("thead");
  var tableBody = document.createElement("tbody");
  var tableContainer = document.getElementById("skills-table-container");
  var tableCaption = document.createElement("caption");
  tableCaption.appendChild(
    document.createTextNode("Technologies | Frameworks | Skills")
  );

  tableHeaders.forEach(function (headerData) {
    var header = document.createElement("th");
    header.appendChild(document.createTextNode(headerData));
    tableHeader.appendChild(header);
  });
  tableData.forEach(function (rowData) {
    var row = document.createElement("tr");

    rowData.forEach(function (cellData) {
      var cell = document.createElement("td");
      // make text bold if emphasized
      if (cellData.includes("*")) {
        cellData = cellData.replace("*", "");
        var bold = document.createElement("b");
        bold.appendChild(document.createTextNode(cellData));
        cell.appendChild(bold);
      } else {
        cell.appendChild(document.createTextNode(cellData));
      }
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableHeader);
  table.appendChild(tableBody);
  table.appendChild(tableCaption);
  tableContainer.appendChild(table);
}

createTable(tableData);
