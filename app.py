import os
import shutil
import time
import hashlib


import click
import markdown
from jinja2 import Environment, PackageLoader, BaseLoader
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from webptools import webplib as webp
from yaml import load, dump

try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper



class Watcher:
    DIRECTORY_TO_WATCH = "./assets"

    def __init__(self):
        self.observer = Observer()

    def run(self):
        event_handler = Handler()
        self.observer.schedule(event_handler, self.DIRECTORY_TO_WATCH, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except KeyboardInterrupt:
            self.observer.stop()
        self.observer.join()


class Handler(FileSystemEventHandler):

    @staticmethod
    def on_any_event(event):
        if event.is_directory:
            return None

        elif event.event_type == 'created':
            # Take any action here when a file is first created.
            print("Received created event - %s." % event.src_path)

        elif event.event_type == 'modified':
            # Taken any action here when a file is modified.
            print("Received modified event - %s." % event.src_path)

        builder()


def build_template(template_key, config):
    env = Environment(loader=PackageLoader(__name__, 'assets/templates'))
    template = env.get_template('{}.html'.format(template_key))

    try:
        config['body'] = ""
    except:
        pass

    html = template.render(**config)

    path = 'dist' if 'index' in template_key else 'dist/{}'.format(template_key.split('.')[0])

    try:
        os.mkdir(path)
    except FileExistsError:
        pass

    with open(path + '/index.html', 'w+') as stream:
        stream.write(html)


def builder():
    with open('app.yaml', 'r') as stream:
        o = load(stream, Loader=Loader)
        app_config = o['app']
        blueprints = o['blueprints']

    sitemap = []
    env = Environment(loader=PackageLoader(__name__, 'assets/templates'))

    # Build static pages
    for template_key in blueprints:
        template_options = blueprints[template_key]
        build_template(template_key, {**app_config})
        sitemap.append(template_key)

    # Compile special items
    with open('dist/sitemap.xml', 'w+') as stream:
        template = env.get_template('sitemap.xml')
        html = template.render({**app_config, **{'urls': sitemap, 'date': '2020-04-13'}})
        stream.write(html)

    with open('dist/robots.txt', 'w+') as stream:
        template = env.get_template('robots.txt')
        html = template.render(**app_config)
        stream.write(html)

    with open('dist/404.html', 'w+') as stream:
        template = env.get_template('404.html')
        html = template.render(**app_config)
        stream.write(html)

    # Collect static assets
    dist_dir = app_config['dist_dir']

    try:
        shutil.rmtree(dist_dir + '/static')
    except:
        pass
    shutil.copytree(src='assets/static', dst=dist_dir + '/static')



@click.group()
def cli():
    pass


@cli.command()
def build():
    builder()


@cli.command()
def watch():
    w = Watcher()
    w.run()


if __name__ == '__main__':
    cli()
