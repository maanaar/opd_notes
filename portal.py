import os
from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

OPD_ROOT = os.path.dirname(os.path.abspath(__file__))


@app.route("/")
def portal():
    return render_template("portal.html")


@app.route("/opd/")
def opd_index():
    return send_from_directory(OPD_ROOT, "index.html")


@app.route("/opd/<path:filename>")
def opd_files(filename):
    return send_from_directory(OPD_ROOT, filename)


if __name__ == "__main__":
    app.run(port=2020, debug=True)
