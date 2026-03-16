# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Roxan Jaecklin | 424398 |
| Samuel Waridel | 330169 |
| Martin Fähnrich | 423634 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

The main dataset for this project is the [Federal Aviation Administration (FAA) Aircraft Wildlife Strike Database (1990–2023)](https://www.kaggle.com/datasets/dianaddx/aircraft-wildlife-strikes-1990-2023), available on Kaggle. It documents incidents of wildlife strikes involving aircraft, primarily bird-related events. The dataset originates from a reputable source (FAA) and carries a usability score of 10 on Kaggle, suggesting high-quality and well-maintained data.

Although the dataset is comprehensive—with over 100 columns covering species, aircraft type, flight phase, and location—some preprocessing will be required. The main tasks include handling missing or unknown entries (notably for bird species), addressing outliers in numeric variables, and ensuring consistent formatting of location and date fields. Overall, the data quality is strong, and preprocessing will focus on cleaning rather than extensive transformation.

A secondary dataset, [A Global Dataset of Directional Migration Networks of Migratory Birds](https://figshare.com/articles/dataset/A_global_dataset_of_directional_migration_networks_of_migratory_birds/26162269/3?file=48041545) provides migration path information derived from a systematic review of English and Chinese literature (1993–2023). The data already includes curated GPS coordinates, which will allow comparison with FAA incident locations to explore geographic correlations. Preprocessing will mainly involve filtering relevant species and migration routes and aligning coordinate systems with the FAA dataset.

The main challenge will be integrating these datasets due to potential differences in spatial resolution and taxonomic naming conventions, but overall, both sources are clean and ready for analysis.


### Problematic

**Topic:**
 Visualizing the Spatial–Temporal “Danger Zone” of Aviation Bird Strikes

**Overview:**
This project explores the intersection of human air travel and natural bird migration. Using FAA wildlife strike data combined with global avian migration routes, we aim to visualize where and when aircraft are most at risk of encountering birds. The central axes of the visualization will be space (geographic location), time (seasonality, year, and flight phase), and flight conditions (altitude and weather).

**Motivation:**
Bird strikes pose both economic and safety threats to aviation, causing significant repair costs and operational disruptions. By overlaying strike incidents with migratory corridors, this project aims to turn historical data into predictive insight — shifting focus from “where strikes happened” to understanding why risk peaks at specific altitudes or seasons.

**Target Audience:**
- Aviation safety officers seeking to anticipate seasonal risks near specific airports.
- Environmental researchers examining how air traffic overlaps with migratory pathways.
- The general public interested in visualizing the shared aerial space between humans and wildlife.


**Analytical Components:**
1. Geospatial correlation: Map overlaps between strike locations and migration routes to identify risk hotspots.
2. Temporal analysis: Examine how strike frequency and severity change across months, years, and airports.
3. Damage profiling: Visualize which aircraft components are most affected and under what flight conditions, offering insights for preventive measures.


### Exploratory Data Analysis

#### Bird Strikes

The 190 MB CSV contains 288,810 entries across 110 columns. Features include binary damage indicators (e.g., struck vs. damaged parts), geography, aircraft specs, flight conditions (speed/altitude), environmental factors (weather/light), wildlife species, and economic costs.

**Missing Data & Quality**

- Gaps: Cost and fatality columns are largely empty. Height, speed, and distance have significant missing values, requiring reliance on PHASE_OF_FLT for context. Weather and coordinates (~10%) also have gaps.
- Cleaning Needed: Latitude values contain errors (max > 41M) and must be cleaned to the valid $\pm 90$ range.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/data/images/ColumnsWithMissingData.png)


**Key Statistical Insights**

- Altitude: Strikes are extremely "bottom-heavy"; the median height is 50 ft, while the mean is 865 ft.
- Speed: The average strike occurs at 142 knots, though some occur at 0 knots (parked/taxiing).
- Severity: Out-of-service time (AOS) averages 3 hours, but outliers reach 7+ years, indicating total destruction.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/data/images/IncidentPerMonth.png)

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/data/images/IncidentsPerYear.png)

**Notable Trends** 

- Analysis shows a clear seasonal peak in summer and a steady upward trend in reported strikes over the 33-year period.

#### Bird FLight Paths

The secondary dataset contains 42,844 entries across 26 columns. It tracks global avian movement via GPS sensor nodes (Origin, Transit, Wintering) and includes full taxonomic classifications (Order, Family, Genus), English names, and IUCN Red List (2023) conservation statuses.

**Missing Data & Quality**

- High Integrity: The dataset is exceptionally complete, with only the Provinces column missing a negligible 19 values (<0.05%).
- Modern Precision: 75% of the data is from 2010 or later, ensuring that the insights are based on modern, high-resolution satellite telemetry rather than legacy banding methods.

**Key Statistical Insights**

- Geography: While coverage is global (spanning from -83° to +78° latitude), the mean latitude of 29.9°N indicates a significant focus on Northern Hemisphere flyways.
- Timing: Migration is highly bimodal. The Autumn surge (July–September) is the largest movement window, followed by a secondary Spring peak (March–April).
- Conservation: While 85.4% are "Least Concern," nearly 15% of tracked movements involve at-risk species (Vulnerable to Critically Endangered), providing vital data for protected transit nodes.

**Notable Trends**

The data reveals a massive concentration of activity during the late summer months, identifying a critical temporal window where high bird density and biodiversity risk intersect.


### Related work


The dataset used in this project originates from the Federal Aviation Administration (FAA) Wildlife Strike Database and contains reports of strikes involving different aircraft since 1990. Because it covers a lot of time and its detailed attributes, the dataset has been widely used for exploratory analysis and visualization projects. Previous work with this dataset has primarily focused on statistical summaries and visualizations. Many analyses explore the frequency of strikes over time, identify the most involved species, or analyze the phases of flight where most incidents happen. Other projects utilize geographic patterns and focus on identifying airports or regions with high numbers of strikes, where the data is often presented using individual charts such as time-series plots, bar charts, or maps highlighting incident hotspots.

These approaches provide valuable insight, but because they often present information through a series of separate visualizations, navigating through them can make it overwhelming. Especially if you want a comprehensive overview of the data to explore relationships between multiple variables simultaneously. Our approach addresses this limitation by proposing a multi-dimensional and interactive visualization that allows users to explore several aspects of the dataset within a single interface. For the design, we drew mostly inspiration from aviation visualization tools such as Flightradar24, which provides a map-based overview of global flight activity. Additionally, heatmaps of frequently affected regions were considered a way to highlight the geographic concentrations of strikes, as well as affected machinery on the plane.  


## Milestone 2 (17th April, 5pm)

**10% of the final grade**


## Milestone 3 (29th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

