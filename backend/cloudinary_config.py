import cloudinary
import os

cloudinary.config(
    cloud_name=os.getenv("nahlb563"),
    api_key=os.getenv("692771129451256"),
    api_secret=os.getenv("zBB50QxyYtxmVFZZUpy_17du-DM"),
    secure=True,
)