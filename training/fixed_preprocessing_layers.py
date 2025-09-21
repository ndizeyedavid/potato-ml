# Fixed preprocessing layers for the potato disease classification model
# Replace the experimental.preprocessing imports with these updated versions

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Fixed resize_and_rescale - replace the cell that has the error
resize_and_rescale = tf.keras.Sequential([
  layers.Resizing(IMAGE_SIZE, IMAGE_SIZE),  # Changed from layers.experimental.preprocessing.Resizing
  layers.Rescaling(1./255),  # Changed from layers.experimental.preprocessing.Rescaling
])

# Fixed data_augmentation - also needs to be updated
data_augmentation = tf.keras.Sequential([
  layers.RandomFlip("horizontal_and_vertical"),  # Changed from layers.experimental.preprocessing.RandomFlip
  layers.RandomRotation(0.2),  # Changed from layers.experimental.preprocessing.RandomRotation
])

# Instructions:
# 1. In your notebook, replace the cell with resize_and_rescale with the code above
# 2. Replace the cell with data_augmentation with the code above
# 3. Make sure IMAGE_SIZE is defined before these cells (it should be 256 based on typical potato classification models)
