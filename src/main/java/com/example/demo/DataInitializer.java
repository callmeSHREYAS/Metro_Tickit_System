package com.example.demo;

import com.example.demo.entity.Fare;
import com.example.demo.entity.Payment;
import com.example.demo.entity.Route;
import com.example.demo.entity.Station;
import com.example.demo.entity.Ticket;
import com.example.demo.entity.User;
import com.example.demo.repository.FareRepository;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.RouteRepository;
import com.example.demo.repository.StationRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository users;
    private final StationRepository stations;
    private final RouteRepository routes;
    private final FareRepository fares;
    private final TicketRepository tickets;
    private final PaymentRepository payments;

    public DataInitializer(UserRepository users, StationRepository stations, RouteRepository routes,
                           FareRepository fares, TicketRepository tickets, PaymentRepository payments) {
        this.users = users;
        this.stations = stations;
        this.routes = routes;
        this.fares = fares;
        this.tickets = tickets;
        this.payments = payments;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedNetwork();
        seedTickets();
    }

    private void seedUsers() {
        if (users.count() > 0) return;
        users.save(user("admin", "Metro", "Admin", "admin123", "ADMIN", "admin@metro.local", "ST-CEN"));
        users.save(user("rider1", "Aarav", "Mehta", "rider123", "USER", "aarav@example.com", null));
        users.save(user("rider2", "Mira", "Shah", "rider123", "USER", "mira@example.com", null));
        users.save(user("operator1", "Neha", "Rao", "operator123", "ADMIN", "neha@metro.local", "ST-AIR"));
    }

    private void seedNetwork() {
        if (stations.count() == 0) {
            stations.save(station("ST-CEN", "Central", "City Center", "#2f80ed", 28.6139f, 77.2090f));
            stations.save(station("ST-UNI", "University", "North Campus", "#2f80ed", 28.6870f, 77.2090f));
            stations.save(station("ST-MKT", "Market", "Civic Market", "#f2994a", 28.6304f, 77.2177f));
            stations.save(station("ST-AIR", "Airport", "Terminal Gateway", "#27ae60", 28.5562f, 77.1000f));
            stations.save(station("ST-RIV", "Riverside", "River Walk", "#bb6bd9", 28.6100f, 77.2400f));
        }

        if (routes.count() == 0) {
            routes.save(route("RT-BLUE", "Blue Line", "ST-UNI", "ST-CEN", "#2f80ed", "18.5", 34));
            routes.save(route("RT-ORANGE", "Airport Express", "ST-CEN", "ST-AIR", "#f2994a", "22.0", 28));
            routes.save(route("RT-GREEN", "River Connector", "ST-MKT", "ST-RIV", "#27ae60", "9.8", 16));
        }

        if (fares.count() == 0) {
            fare("FR-01", "ST-CEN", "ST-UNI", "25.00");
            fare("FR-02", "ST-CEN", "ST-MKT", "18.00");
            fare("FR-03", "ST-CEN", "ST-AIR", "60.00");
            fare("FR-04", "ST-MKT", "ST-RIV", "22.00");
            fare("FR-05", "ST-UNI", "ST-AIR", "70.00");
            fare("FR-06", "ST-RIV", "ST-CEN", "28.00");
        }
    }

    private void seedTickets() {
        if (tickets.count() > 0) return;
        LocalDateTime now = LocalDateTime.now();
        Ticket ticket = new Ticket();
        ticket.ticketId = "T-DEMO-01";
        ticket.passengerId = "rider1";
        ticket.fareId = "FR-01";
        ticket.sourceStationId = "ST-CEN";
        ticket.destStationId = "ST-UNI";
        ticket.ticketType = "SINGLE";
        ticket.issueTime = now.minusHours(2);
        ticket.createdAt = ticket.issueTime;
        ticket.validUntil = now.plusHours(22);
        ticket.isUsed = false;
        tickets.save(ticket);

        Payment payment = new Payment();
        payment.paymentId = "P-DEMO-01";
        payment.ticketId = ticket.ticketId;
        payment.amount = new BigDecimal("25.00");
        payment.createdAt = ticket.createdAt;
        payments.save(payment);
    }

    private User user(String id, String first, String last, String password, String role, String contact, String stationId) {
        User user = new User();
        user.userId = id;
        user.firstName = first;
        user.lastName = last;
        user.password = password;
        user.role = role;
        user.contact = contact;
        user.registrationDate = LocalDate.now();
        user.isActive = true;
        user.hireDate = "ADMIN".equals(role) ? LocalDate.now().minusYears(1) : null;
        user.stationId = stationId;
        return user;
    }

    private Station station(String id, String code, String address, String color, Float latitude, Float longitude) {
        Station station = new Station();
        station.stationId = id;
        station.stationCode = code;
        station.address = address;
        station.lineColor = color;
        station.latitude = latitude;
        station.longitude = longitude;
        station.openedDate = LocalDate.now().minusYears(3);
        station.isActive = true;
        return station;
    }

    private Route route(String id, String name, String start, String end, String color, String distance, Integer time) {
        Route route = new Route();
        route.routeId = id;
        route.routeName = name;
        route.startStationId = start;
        route.endStationId = end;
        route.lineColor = color;
        route.totalDistance = new BigDecimal(distance);
        route.estimatedTime = time;
        route.createdAt = LocalDateTime.now();
        route.updatedAt = route.createdAt;
        return route;
    }

    private void fare(String id, String source, String destination, String amount) {
        Fare fare = new Fare();
        fare.fareId = id;
        fare.sourceStationId = source;
        fare.destStationId = destination;
        fare.baseFare = new BigDecimal(amount);
        fares.save(fare);
    }
}
