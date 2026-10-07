package com.example.demo;

import com.example.demo.controller.MetroController;
import com.example.demo.repository.FareRepository;
import com.example.demo.repository.MaintenanceIssueRepository;
import com.example.demo.repository.MetroCardRepository;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.RouteRepository;
import com.example.demo.repository.RouteStationRepository;
import com.example.demo.repository.ScheduleRepository;
import com.example.demo.repository.StationRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.TrainRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class DemoApplicationTests {

	@Autowired private MetroController controller;
	@Autowired private UserRepository users;
	@Autowired private StationRepository stations;
	@Autowired private RouteRepository routes;
	@Autowired private FareRepository fares;
	@Autowired private TicketRepository tickets;
	@Autowired private PaymentRepository payments;
	@Autowired private MetroCardRepository cards;
	@Autowired private TrainRepository trains;
	@Autowired private ScheduleRepository schedules;
	@Autowired private RouteStationRepository routeStations;
	@Autowired private MaintenanceIssueRepository maintenanceIssues;

	@Test
	void contextLoads() {
	}

	@Test
	void allMetroTablesReceiveDemoData() {
		assertTrue(users.count() > 0);
		assertTrue(stations.count() > 0);
		assertTrue(routes.count() > 0);
		assertTrue(fares.count() > 0);
		assertTrue(tickets.count() > 0);
		assertTrue(payments.count() > 0);
		assertTrue(cards.count() > 0);
		assertTrue(trains.count() > 0);
		assertTrue(schedules.count() > 0);
		assertTrue(routeStations.count() > 0);
		assertTrue(maintenanceIssues.count() > 0);
	}

	@Test
	void allMetroResourcesAreAvailableThroughTheController() {
		assertTrue(controller.users().size() > 0);
		assertTrue(controller.stations().size() > 0);
		assertTrue(controller.routes().size() > 0);
		assertTrue(controller.fares().size() > 0);
		assertTrue(controller.tickets().size() > 0);
		assertTrue(controller.payments().size() > 0);
		assertTrue(controller.cards().size() > 0);
		assertTrue(controller.trains().size() > 0);
		assertTrue(controller.schedules().size() > 0);
		assertTrue(controller.routeStations().size() > 0);
		assertTrue(controller.maintenanceIssues().size() > 0);
	}
}
