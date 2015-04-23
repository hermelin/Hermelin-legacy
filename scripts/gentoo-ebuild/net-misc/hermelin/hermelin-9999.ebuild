# Copyright 1999-2014 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: /var/cvsroot/gentoo-x86/net-misc/hermelin/hermelin-9999.ebuild,v 1.9 2014/12/28 18:47:11 floppym Exp $

EAPI=5

PYTHON_COMPAT=( python2_7 )

inherit cmake-utils git-2 python-single-r1

DESCRIPTION="lightweight & open source microblogging client"
HOMEPAGE="https://github.com/remhume/Hermelin"
EGIT_REPO_URI="git://github.com/remhume/Hermelin.git"

LICENSE="LGPL-3"
SLOT="0"
KEYWORDS=""
IUSE="gtk2 gtk3 gir qt4 qt5 kde chrome"

REQUIRED_USE="|| ( gtk2 gtk3 gir qt4 qt5 kde chrome  ) ${PYTHON_REQUIRED_USE}"

RDEPEND="${PYTHON_DEPS}
	dev-python/dbus-python[${PYTHON_USEDEP}]
	gtk2? ( dev-python/pywebkitgtk[${PYTHON_USEDEP}] )
	gtk3? ( dev-python/pywebkitgtk[${PYTHON_USEDEP}] )
	gir? ( dev-python/pywebkitgtk[${PYTHON_USEDEP}] )
	qt4? ( dev-qt/qtwebkit:4
		kde? ( kde-base/kdelibs ) )
	qt5? ( dev-qt/qtwebkit:5
		kde? ( kde-base/kdelibs ) )"
DEPEND="${RDEPEND}
	sys-devel/gettext
	qt4? ( dev-qt/qtsql:4 )
	qt5? ( dev-qt/qtsql:5 )"

pkg_setup() {
	if ! use gtk2 ; then
		if ! use gtk3 ; then
			if ! use qt4 ; then
				if ! use qt5 ; then
					ewarn "neither gtk nor qt binaries will be build"
				fi
			fi
		fi
	fi
	python-single-r1_pkg_setup
}

src_configure() {
	mycmakeargs=(
		${mycmakeargs}
		$(cmake-utils_use_with chrome CHROME)
		$(cmake-utils_use_with gtk2 GTK)
		$(cmake-utils_use_with gtk3 GTK)
		$(cmake-utils_use_with gir GTK)
		$(cmake-utils_use_with gtk2 GTK2)
		$(cmake-utils_use_with gtk3 GTK3)
		$(cmake-utils_use_with gir GIR)
		$(cmake-utils_use_with kde KDE)
		$(cmake-utils_use_with qt4 QT)
		$(cmake-utils_use_with qt5 QT)
		$(cmake-utils_use_with qt4 QT4)
		$(cmake-utils_use_with qt4 QT5)
		-DPYTHON_EXECUTABLE=${PYTHON} )

	cmake-utils_src_configure
}

src_install() {
	cmake-utils_src_install

	find "${D}" -name "*.pyc" -delete
}

pkg_postinst() {
	if use chrome; then
		elog "TO install hermelin for chrome, open chromium/google-chrome,"
		elog "vist chrome://chrome/extensions/ and load /usr/share/hermelin"
		elog "as unpacked extension."
	fi
}
