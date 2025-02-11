import numpy as np
import pandas as pd
import scipy.cluster.hierarchy as sch
import matplotlib.pyplot as plt
import io
import base64

# Sample data
variables = ["Buscar veterinaria", "Mapa", "QR", "Citas"]
matrix = np.array([[0, 3, 1, 2], [3, 0, 2, 1], [1, 2, 0, 4], [2, 1, 4, 0]])

# Clustering
Z = sch.linkage(matrix, method='ward')

# Plot dendrogram
fig, ax = plt.subplots(figsize=(8, 6))
sch.dendrogram(Z, labels=variables, orientation="right", ax=ax)

# Save as base64
buf = io.BytesIO()
fig.savefig(buf, format="png", bbox_inches="tight")
buf.seek(0)
base64.b64encode(buf.read()).decode("utf-8")
