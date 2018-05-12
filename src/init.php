<?php
function _failure($message) {
    http_response_code(500);
    header("Content-Type: text/plain");

    echo "Fatal error ლ(ಠ益ಠლ\n";
    echo "-----------\n\n";
    echo $message;

    exit(1);
}

// Checking version and dependencies

version_compare(PHP_VERSION, '7.0.0', '>=')
or _failure("Required PHP version 7.0 or newer.\nYou can try install will `$ sudo apt-get install php7.0`.");

$appDir = dirname(__DIR__);
in_array("mod_rewrite", apache_get_modules())
or _failure("Required is enabled rewrite module. Remember to enable of .htaccess for $appDir. \n" . <<<EOF
You can try install with `$ sudo a2enmod rewrite` and enable .htaccess:
    <Directory $appDir>
         AllowOverride All
         Order allow,deny
         allow from all
    </Directory>
and appending this to your site configuration file, usually is inside /etc/apache2/site-enabled/.
EOF
);

extension_loaded("mongodb")
or _failure("Required is mongodb extension.\n".
    "You can try install with `$ sudo pecl install mongodb` and finally append `extension=mongodb.so` to your php.ini.");

// Set/override default configuration

ini_set("session.name", "session_id");
ini_set("short_open_tag", "On");
