import os
import zipfile
import pathlib

srcdir = "src"
output_name = "debug-stick.mcpack"

print("Packaging .mcpack add-on...")

with zipfile.ZipFile(output_name, "w", zipfile.ZIP_DEFLATED) as zipf:

	# iterate over all files
	for root, dirs, files in os.walk(srcdir):

		# relative path to src folder
		relroot = pathlib.Path(root).relative_to(srcdir)

		# files within src folder
		for file in files:
			zipf.write(os.path.join(root, file), relroot / file)

	# add the license file
	zipf.write("LICENSE")

print(f"Pack done! At: {output_name}")
